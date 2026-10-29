import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// Keep the existing Hooks checks. React Compiler is not enabled; adopting its
// additional lint rules across the app is separate from this security upgrade.
const existingHookRules = new Set(['react-hooks/rules-of-hooks', 'react-hooks/exhaustive-deps'])
const compatibleVitals = nextVitals.map(config => ({
  ...config,
  rules: Object.fromEntries(Object.entries(config.rules ?? {}).filter(([rule]) =>
    !rule.startsWith('react-hooks/') || existingHookRules.has(rule))),
}))

export default defineConfig([
  ...compatibleVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'test-results/**', 'playwright-report/**']),
])
