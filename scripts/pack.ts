import del from 'del'
import mkdirp from 'mkdirp'
import { join, resolve } from 'node:path'
import { register, spawnAsync } from 'yakumo'

register('nbp-pack', async (project) => {
  const pathDist = resolve(__dirname, '../build/dist')
  await del(pathDist)
  await mkdirp(pathDist)

  await Promise.all(
    Object.keys(project.targets)
      .filter((path) => path.startsWith('/plugins'))
      .map((path) => project.targets[path])
      .map((pkgJson) =>
        spawnAsync([
          'yarn',
          'workspace',
          pkgJson.name,
          'pack',
          '-f',
          join(pathDist, `${pkgJson.name.slice(9)}-${pkgJson.version}.tgz`),
        ])
      )
  )
})
