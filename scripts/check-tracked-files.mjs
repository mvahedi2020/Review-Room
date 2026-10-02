import { execFileSync } from 'node:child_process'
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
const blocked = files.filter(file => /(^|\/)(?:\.next|\.vercel|node_modules|dist|test-results|playwright-report)\//.test(file) || /(^|\/)\.env(?:$|\.)/.test(file) && !file.endsWith('.env.example'))
if (blocked.length) throw new Error('Remove tracked runtime or environment files before release: ' + blocked.join(', '))
