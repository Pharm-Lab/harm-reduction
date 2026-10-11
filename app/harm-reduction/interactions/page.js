'use client'
import { useState } from 'react'
import Window from '@/app/components/Window'
import { SUBSTANCES, SEVERITY, getInteractionMatrix } from '../../../lib/interactions.js'

export default function InteractionChecker() {
  const [selected, setSelected] = useState([])

  const recreational  = SUBSTANCES.filter(s => s.category === 'recreational')
  const prescription  = SUBSTANCES.filter(s => s.category === 'prescription')
  const interactions  = selected.length >= 2 ? getInteractionMatrix(selected) : []
  const worstSeverity = interactions.length > 0 ? interactions[0].severity : null

  function toggle(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function getSub(id) { return SUBSTANCES.find(s => s.id === id) }

  const chipStyle = () => ({ padding: '4px 10px', fontSize: '13.5px', minHeight: '24px', userSelect: 'none' })

  return (
    <main className="xp-desktop">
      <Window title="Drug interaction checker" icon="interactions" closeHref="/harm-reduction" status={['Sources: TripSit and published pharmacology', 'Runs on your device. Nothing you enter is sent anywhere.']}>
      <p className="xp-intro">
        Select two or more substances to see all interactions. Severity ratings are hardcoded from pharmacological literature — not AI-generated.
      </p>

      {/* Critical note */}
      <div className="xp-alert xp-alert-error" style={{ marginBottom: '1.5rem', fontSize: '13.5px' }}>
        <strong>This tool shows pharmacological interactions only.</strong> Real-world risk depends on dose, individual health, tolerance, and setting. Unknown combinations (no data available) are not necessarily safe. If you are on prescription medication, discuss any substance use with your doctor or pharmacist.
      </div>

      {/* Substance selector */}
      <div className="xp-group" style={{ marginBottom: '1.5rem', padding: '12px 14px' }}>
        <div style={{ marginBottom: '14px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', fontWeight: '600', marginBottom: '8px' }}>Recreational substances</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {recreational.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)} style={chipStyle()} aria-pressed={selected.includes(s.id)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', fontWeight: '600', marginBottom: '4px' }}>Prescription / medication</p>
          <p style={{ fontSize: '12.5px', color: 'var(--xp-text-dim)', marginBottom: '8px' }}>
            Include if you take these regularly or have taken them recently.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {prescription.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)} style={chipStyle()} aria-pressed={selected.includes(s.id)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13.5px', color: 'rgba(240,244,255,0.6)' }}>
              <strong>{selected.length}</strong> substance{selected.length > 1 ? 's' : ''} selected
            </div>
            <button onClick={() => setSelected([])}
              style={{ fontSize: '13.5px', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {selected.length < 2 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(240,244,255,0.25)', fontSize: '15.5px' }}>
          Select at least 2 substances to see interactions
        </div>
      )}

      {interactions.length > 0 && (
        <div>
          {/* Summary banner */}
          {worstSeverity && (
            <div style={{
              padding: '12px 16px', borderRadius: '3px', marginBottom: '1rem',
              background: { LETHAL:'rgba(88,0,0,0.4)', DANGEROUS:'rgba(120,20,20,0.35)', SEVERE:'rgba(185,28,28,0.22)', HIGH:'rgba(120,53,15,0.28)', MODERATE:'rgba(113,63,18,0.22)', CAUTION:'rgba(113,63,18,0.18)', LOW:'rgba(22,78,30,0.2)', LOW_RISK:'rgba(22,78,30,0.18)', UNKNOWN:'rgba(255,255,255,0.04)' }[worstSeverity] ?? SEVERITY[worstSeverity].bg,
              border: `2px solid ${{ LETHAL:'rgba(239,68,68,0.75)', DANGEROUS:'rgba(239,68,68,0.65)', SEVERE:'rgba(239,68,68,0.55)', HIGH:'rgba(249,115,22,0.55)', MODERATE:'rgba(234,179,8,0.5)', CAUTION:'rgba(234,179,8,0.4)', LOW:'rgba(34,197,94,0.45)', LOW_RISK:'rgba(34,197,94,0.35)', UNKNOWN:'rgba(255,255,255,0.12)' }[worstSeverity] ?? SEVERITY[worstSeverity].border}`,
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>
                {worstSeverity === 'LETHAL' ? '☠️' : worstSeverity === 'DANGEROUS' ? '⛔' : worstSeverity === 'SEVERE' ? '🚨' : worstSeverity === 'HIGH' ? '⚠️' : 'ℹ️'}
              </span>
              <div>
                <div style={{ fontSize: '15.5px', fontWeight: 'bold', color: '#fff' }}>
                  Most severe: {SEVERITY[worstSeverity].label}
                </div>
                <div style={{ fontSize: '13.5px', color: '#d6d9ea' }}>
                  {interactions.length} interaction{interactions.length > 1 ? 's' : ''} found for {selected.length} substances
                </div>
              </div>
            </div>
          )}

          {/* Interaction cards */}
          {interactions.map((inter, i) => {
            const sev  = SEVERITY[inter.severity]
            const subA = getSub(inter.a)
            const subB = getSub(inter.b)
            const darkBg = {
              LETHAL:    'rgba(88,0,0,0.4)',
              DANGEROUS: 'rgba(120,20,20,0.35)',
              SEVERE:    'rgba(185,28,28,0.22)',
              HIGH:      'rgba(120,53,15,0.28)',
              MODERATE:  'rgba(113,63,18,0.22)',
              CAUTION:   'rgba(113,63,18,0.18)',
              LOW:       'rgba(22,78,30,0.2)',
              LOW_RISK:  'rgba(22,78,30,0.18)',
              UNKNOWN:   'rgba(255,255,255,0.04)',
            }
            const darkBorder = {
              LETHAL:    'rgba(239,68,68,0.75)',
              DANGEROUS: 'rgba(239,68,68,0.65)',
              SEVERE:    'rgba(239,68,68,0.55)',
              HIGH:      'rgba(249,115,22,0.55)',
              MODERATE:  'rgba(234,179,8,0.5)',
              CAUTION:   'rgba(234,179,8,0.4)',
              LOW:       'rgba(34,197,94,0.45)',
              LOW_RISK:  'rgba(34,197,94,0.35)',
              UNKNOWN:   'rgba(255,255,255,0.12)',
            }
            return (
              <div key={i} style={{
                marginBottom: '10px',
                border: `1px solid ${darkBorder[inter.severity] ?? sev.border}`,
                borderRadius: '3px',
                overflow: 'hidden',
                background: darkBg[inter.severity] ?? sev.bg,
              }}>
                <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16.5px' }}>{subA?.emoji}</span>
                    <span style={{ fontSize: '15.5px', fontWeight: '600', color: 'var(--xp-text)' }}>{subA?.name}</span>
                    <span style={{ fontSize: '14.5px', color: 'var(--xp-text-dim)' }}>+</span>
                    <span style={{ fontSize: '16.5px' }}>{subB?.emoji}</span>
                    <span style={{ fontSize: '15.5px', fontWeight: '600', color: 'var(--xp-text)' }}>{subB?.name}</span>
                    {(subA?.rx || subB?.rx) && (
                      <span style={{ fontSize: '11.5px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)', fontWeight: '500' }}>Rx</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '12.5px', fontWeight: '700', padding: '3px 10px',
                    borderRadius: '2px', background: sev.color, color: 'white', whiteSpace: 'nowrap',
                  }}>
                    {sev.label}
                  </span>
                </div>

                <div style={{ padding: '0 14px 12px' }}>
                  <p style={{ fontSize: '14.5px', color: 'rgba(240,244,255,0.8)', opacity: 1, margin: '0 0 6px', lineHeight: '1.6' }}>
                    {inter.mechanism}
                  </p>
                  {inter.warning && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginTop: '6px', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}>
                      <span style={{ fontSize: '14.5px', flexShrink: 0 }}>⚠️</span>
                      <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--xp-text)', margin: 0, lineHeight: '1.5' }}>
                        {inter.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Footer */}
          <div className="xp-group" style={{ marginTop: '1rem', fontSize: '12.5px', color: 'var(--xp-text-dim)', lineHeight: '1.6', padding: '12px 14px' }}>
            Interactions sourced from TripSit interaction database, published pharmacology literature, and clinical case reports. Severity ratings are hardcoded — not AI-generated. For prescription drug interactions, always consult a pharmacist or physician.
          </div>
        </div>
      )}
      </Window>
    </main>
  )
}