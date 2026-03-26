import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Pull recent git commits for the changelog
let changelog = []
try {
  const log = execSync('git log --oneline -15 --format="%s"', { encoding: 'utf-8' })
  changelog = log.split('\n').filter(Boolean)
    .filter(msg => !msg.match(/^(merge|fix typo|fix spelling|revert)/i))
    .map(msg => msg.replace(/\s*https:\/\/claude\.ai\/.*$/, '').trim())
    .filter(msg => msg.length > 10)
    .slice(0, 10)
} catch {}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __CHANGELOG__: JSON.stringify(changelog),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
