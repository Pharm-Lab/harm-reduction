import { Suspense } from 'react'
import fs from 'node:fs'
import path from 'node:path'
import ModelsView from './ModelsView'

export const metadata = { title: 'Models | myClearance' }

// The code shown on the page is read from the site's own files at build time,
// so it is always the code the calculators actually run.
// Each path is written out in full so the build only includes these files.
const TEXT = {
  'lib/mdmamath.js': () => fs.readFileSync(path.join(process.cwd(), 'lib', 'mdmamath.js'), 'utf8'),
  'lib/bacmath.js': () => fs.readFileSync(path.join(process.cwd(), 'lib', 'bacmath.js'), 'utf8'),
  'scripts/mdma_model/model.py': () => fs.readFileSync(path.join(process.cwd(), 'scripts', 'mdma_model', 'model.py'), 'utf8'),
  'scripts/mdma_model/fit.py': () => fs.readFileSync(path.join(process.cwd(), 'scripts', 'mdma_model', 'fit.py'), 'utf8'),
  'scripts/mdma_model/check.py': () => fs.readFileSync(path.join(process.cwd(), 'scripts', 'mdma_model', 'check.py'), 'utf8'),
  'scripts/mdma_model/expected_check_output.txt': () => fs.readFileSync(path.join(process.cwd(), 'scripts', 'mdma_model', 'expected_check_output.txt'), 'utf8'),
  'scripts/mdma_model/expected_fit_output.txt': () => fs.readFileSync(path.join(process.cwd(), 'scripts', 'mdma_model', 'expected_fit_output.txt'), 'utf8'),
  'scripts/mdma_model/README.md': () => fs.readFileSync(path.join(process.cwd(), 'scripts', 'mdma_model', 'README.md'), 'utf8'),
}
function read(rel) {
  try { return TEXT[rel]() } catch { return `File not found: ${rel}` }
}

const FILES = {
  mdma: [
    { path: 'lib/mdmamath.js', note: 'the model as it runs on the site' },
    { path: 'scripts/mdma_model/model.py', note: 'the same model in Python' },
    { path: 'scripts/mdma_model/fit.py', note: 'refits the free values' },
    { path: 'scripts/mdma_model/check.py', note: 'compares with the studies' },
    { path: 'scripts/mdma_model/expected_check_output.txt', note: 'what check.py should print' },
    { path: 'scripts/mdma_model/expected_fit_output.txt', note: 'what fit.py should print' },
    { path: 'scripts/mdma_model/README.md', note: 'how to run it' },
  ],
  alcohol: [
    { path: 'lib/bacmath.js', note: 'the model as it runs on the site' },
  ],
}

export default function ModelsPage() {
  const files = Object.fromEntries(Object.entries(FILES).map(([k, list]) => [k, list.map(f => ({ ...f, text: read(f.path) }))]))
  return (
    <Suspense fallback={null}>
      <ModelsView files={files} />
    </Suspense>
  )
}
