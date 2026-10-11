// Content for the substance information pages.
// Every claim here comes from a source in lib/sources.js (listed per page in `sources`).
// Interactive PK-PD tools for these substances are being rebuilt and marked "coming soon".

export const SUBSTANCES = {
  mdma: {
    title: 'MDMA',
    intro: 'MDMA is the active ingredient in ecstasy pills and crystals. Pills in Europe are strong compared with ten or fifteen years ago, which makes knowing what you have more important than ever.',
    alert: {
      kind: 'error',
      title: 'Pills are strong, and some contain something else.',
      text: 'In 2024 the average Dutch ecstasy pill contained 143 mg of MDMA, and pills with 300 mg or more are still sold in Europe. Users report more negative than positive effects from around 160 mg. In 2025, drug checking services found unexpected substances in 15% of MDMA samples, most often cathinones. Getting your pill tested tells you both what is in it and how strong it is.',
    },
    facts: [
      { title: 'Timing', text: 'MDMA reaches its highest level in the blood within about two hours. Its half-life is 6 to 7 hours, so a large part is still in your body the next morning.' },
      { title: 'Overheating and water', text: 'Overheating is one of the main short-term risks. Drinking far too much water is also dangerous: water intoxication is a known risk.' },
      { title: 'Testing in the Netherlands', text: 'Ecstasy is the drug handed in most often at testing services connected to the Drugs Information and Monitoring System (DIMS).' },
    ],
    combos: [
      { with: 'Alcohol', text: 'Alcohol was involved in about half of MDMA-related hospital visits in Europe where this was recorded. Both stress the body during a long night out.' },
      { with: 'Antidepressants (MAOIs, SSRIs)', text: 'MAOIs with MDMA can be life-threatening. SSRIs weaken the effect of MDMA, which tempts people to take more. Check the interaction checker before combining.' },
      { with: 'Other stimulants', text: 'Cocaine, amphetamine or cathinones on top of MDMA add to the strain on your heart and the risk of overheating.' },
    ],
    sources: ['trimbos_xtc', 'edr2026_mdma', 'euda_mdma_profile', 'tripsit_combos'],
  },

  cannabis: {
    title: 'Cannabis',
    intro: 'Smoking and eating cannabis feel very different, mostly because of timing. Edibles are increasingly sold in Dutch coffeeshops, so the timing difference matters for more people.',
    alert: {
      kind: 'error',
      title: 'Edibles take much longer than you think.',
      text: 'Edibles take about 30 minutes to 2 hours to kick in, peak around 4 hours after eating and can last up to 12 hours. Taking more because "nothing is happening" is the most common way people end up far higher than they wanted. Wait for the full effect before deciding on more.',
    },
    facts: [
      { title: 'Mental health', text: 'People who use often have a higher risk of anxiety and psychosis. The younger someone starts and the more they use, the bigger the risks.' },
    ],
    combos: [
      { with: 'Alcohol', text: 'Both slow you down, so together they impair you more than either alone. Never drive after using either.' },
      { with: 'Psychedelics and ketamine', text: 'Cannabis can make these experiences more intense and harder to handle.' },
    ],
    sources: ['ccsa_edibles', 'trimbos_cannabis', 'tripsit_combos'],
  },

  cocaine: {
    title: 'Cocaine',
    intro: 'Cocaine in Europe is purer than it used to be, and it is often used together with alcohol. Both make the risks bigger than many people expect.',
    alert: {
      kind: 'error',
      title: 'Purity is high, and mixing with alcohol makes it worse.',
      text: 'Retail cocaine purity in Europe ranged from 48% to 92% in 2024, 44% higher than in 2014. With alcohol, your body forms cocaethylene, which can raise the health risks further. Cocaine can cause heart attacks and strokes.',
    },
    facts: [
      { title: 'What else is in it', text: 'Drug checking services in 2025 most often found caffeine (5% of samples), procaine and phenacetin (4% each) and levamisole (3%). In the Netherlands, 65.8% of samples sold as cocaine in 2024 contained only cocaine.' },
      { title: 'Dependence', text: 'Regular use can quickly lead to psychological dependence.' },
    ],
    combos: [
      { with: 'Alcohol', text: 'Forms cocaethylene in the body, which can increase the health risks. This combination is very common.' },
      { with: 'Other stimulants', text: 'MDMA, amphetamine or cathinones add to the strain on your heart and blood vessels.' },
    ],
    sources: ['edr2026_cocaine', 'trimbos_cocaine', 'tripsit_combos'],
  },

  amphetamines: {
    title: 'Amphetamines',
    intro: 'Amphetamine (speed) works for many hours, and what is sold as speed often contains other substances too.',
    alert: {
      kind: 'warn',
      title: 'It lasts longer than the night.',
      text: 'Effects start within about 30 minutes and last many hours. The half-life is roughly 4 to 12 hours, depending on your urine pH, so sleep is often impossible for a long time after the last use. The comedown can bring irritability, anxiety and low mood.',
    },
    facts: [
      { title: 'What else is in it', text: 'In early 2024, about 60% of amphetamine samples tested by European drug checking services contained another psychoactive substance, most often caffeine.' },
      { title: 'Heart and mind', text: 'Amphetamine raises heart rate and blood pressure. Being intoxicated can cause agitation, confusion and paranoia.' },
    ],
    combos: [
      { with: 'Alcohol', text: 'Amphetamine hides how drunk you are, so it is easy to drink far more than you notice.' },
      { with: 'MAOIs', text: 'This combination can be life-threatening.' },
      { with: 'Other stimulants', text: 'Cocaine, MDMA or cathinones add to the strain on your heart.' },
    ],
    sources: ['euda_amph_profile', 'edr2025_stimulants', 'tripsit_combos'],
  },

  ketamine: {
    title: 'Ketamine',
    intro: 'Ketamine is a medicine used for anaesthesia and pain relief. Recreational use has grown in the Netherlands, and so has the number of people seeking help for it.',
    alert: {
      kind: 'error',
      title: 'Regular use can permanently damage your bladder.',
      text: 'Regular ketamine use can cause lasting damage to the bladder and kidneys, or liver problems. If you use ketamine and get bladder pain or need to pee much more often, see a doctor.',
    },
    facts: [
      { title: 'Addiction', text: 'Ketamine can be addictive. The number of people in the Netherlands seeking help for ketamine rose from 29 in 2015 to 649 in 2024.' },
      { title: 'K-hole', text: 'At high doses you can end up unable to move, which can be a frightening experience. Using ketamine while struggling with mental health problems can be very dangerous.' },
    ],
    combos: [
      { with: 'Other drugs, especially alcohol', text: 'Most ketamine problems that need medical care happen when it is combined with other drugs.' },
    ],
    sources: ['trimbos_ketamine', 'tripsit_combos'],
  },

  cathinones: {
    title: 'Synthetic cathinones',
    intro: 'Cathinones such as 3-MMC and 2-MMC are stimulants that became popular in Dutch nightlife. Since 3-MMC was banned in April 2024, what is sold under that name is almost never 3-MMC.',
    alert: {
      kind: 'error',
      title: '"3-MMC" is almost never 3-MMC.',
      text: 'Of the samples sold as 3-MMC that were tested in the Netherlands in 2025, only 3% contained 3-MMC. Most contained 2-MMC (76%), and 5% contained NEP, which is more potent. You cannot tell them apart without testing.',
    },
    facts: [
      { title: 'Reported problems', text: 'People report anxiety, agitation, chest pain, palpitations, high blood pressure, heart rhythm problems and seizures after using cathinones. The addiction risk is high.' },
      { title: 'Little research', text: 'The effects of many cathinones on humans have not been well researched. Across Europe, the number of people entering treatment for cathinones rose from 536 in 2018 to 2,671 in 2024.' },
    ],
    combos: [
      { with: 'Anything', text: 'Because you rarely know which cathinone you have, every combination is less predictable. Other stimulants add to the strain on your heart.' },
    ],
    market: {
      year: 2025,
      rows: [
        { label: '2-MMC', value: 76, color: '#f97316' },
        { label: 'Other or mixed', value: 16, color: '#8b8fa8' },
        { label: 'NEP', value: 5, color: '#d8452b' },
        { label: '3-MMC (what was asked for)', value: 3, color: '#2fb34a' },
      ],
      note: 'Share of samples sold as 3-MMC containing 3-MMC: 30% in 2023, 13% in 2024, 3% in 2025.',
    },
    compounds: [
      { name: '3-MMC', badge: 'Name on the bag, rarely inside', kind: 'warn', text: 'On list I of the Dutch Opium Act since 11 April 2024. Since the ban, products sold as 3-MMC usually contain other cathinones such as 2-MMC or 3-CMC.' },
      { name: '2-MMC', badge: 'Most common actual content', kind: 'info', text: 'Found in 76% of samples sold as 3-MMC in 2025. It is hard to say whether it is more harmful than 3-MMC, because it has barely been studied.' },
      { name: 'NEP', badge: 'More potent', kind: 'error', text: 'Found in 5% of samples sold as 3-MMC in 2025. More potent than 2-MMC and 3-MMC, and can cause insomnia and anxiety. Taking the amount you are used to can be too much.' },
    ],
    sources: ['trimbos_3mmc_news', 'trimbos_3mmc', 'edr2026_stimulants', 'tripsit_combos'],
  },
}
