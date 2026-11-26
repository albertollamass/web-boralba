import { writeFile } from 'node:fs/promises'

const status = {
  lastSuccessfulDeployment: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  source: 'github-pages',
}

await writeFile('public/deployment-status.json', `${JSON.stringify(status)}\n`)
