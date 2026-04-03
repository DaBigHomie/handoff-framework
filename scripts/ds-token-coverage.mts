/**
 * scripts/ds-token-coverage.mts — Token coverage quality gate
 *
 * Scans component files for DS token usage.
 * Exits 1 if any component lacks token classes.
 *
 * @see docs/DESIGN-SYSTEM-REFERENCE.md — Token Registry
 */

import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { existsSync } from "node:fs"

const TOKEN_PATTERN = /\b(bg-|text-|border-|shadow-|ring-|dark:|--color-|var\(--|data-theme|color-scheme)/

const COMPONENT_DIRS = ["examples/components"]

async function checkDirectory(dir: string): Promise<{ file: string; covered: boolean }[]> {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const results: { file: string; covered: boolean }[] = []

  for (const entry of entries) {
    if (!entry.name.endsWith(".tsx") || entry.name.includes(".test.")) continue
    const content = await readFile(join(dir, entry.name), "utf-8")
    results.push({
      file: join(dir, entry.name),
      covered: TOKEN_PATTERN.test(content),
    })
  }

  return results
}

async function main() {
  console.log("=== DS Token Coverage ===\n")

  const allResults: { file: string; covered: boolean }[] = []

  for (const dir of COMPONENT_DIRS) {
    const results = await checkDirectory(dir)
    allResults.push(...results)
  }

  if (allResults.length === 0) {
    console.log("No component files found to scan.")
    console.log("✅ Token coverage: N/A (no components)")
    process.exit(0)
  }

  console.table(allResults)

  const uncovered = allResults.filter((r) => !r.covered)

  if (uncovered.length > 0) {
    console.error(`\n❌ ${uncovered.length} component(s) have no DS token coverage:`)
    uncovered.forEach((r) => console.error(`   - ${r.file}`))
    process.exit(1)
  }

  console.log(`\n✅ Token coverage: ${allResults.length}/${allResults.length} components pass`)
}

main().catch((err) => {
  console.error("Token coverage check failed:", err)
  process.exit(1)
})
