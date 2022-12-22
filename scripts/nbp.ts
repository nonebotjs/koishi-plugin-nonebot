import { mkdir, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { register } from 'yakumo'
import type { Nbp } from './types'
import { download, exists, spawnOutput } from './utils'

const blacklist = [
  'nonebot-adapter-onebot',
  'nonebot2',
  'httpx',
  'aiohttp',
  'pydantic',
  'build',
  'twine',
]

interface JohnnydepItem {
  name: string
  version_latest_in_spec: string
  download_link: string
  requires: string[]
}

const blacklisted = (x: string) =>
  !blacklist.some(
    (y) => x.split('<')[0].split('>')[0].split('=')[0].split('!')[0] === y
  )

const buildNonebot = async () => {
  const pathPackage = resolve(__dirname, '../packages/nonebot')
  const pathDist = join(pathPackage, 'dist')

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })
}

const buildPlugin = async (path: string) => {
  const pathPackage = resolve(__dirname, `..${path}`)
  const pathDist = join(pathPackage, 'dist')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nbp: Nbp = require(join(pathPackage, 'nbp.json'))

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })

  // Parents of each cycle
  let parents: string[] = [`${nbp.name}==${nbp.version}`]
  // Finally collected deps
  const deps: JohnnydepItem[] = []

  while (parents.length) {
    // Collected results
    const results: JohnnydepItem[][] = []

    // Collect
    for (const parent of parents)
      results.push(
        JSON.parse(
          await spawnOutput('python3', [
            '-m',
            'johnnydep',
            '-f',
            'ALL',
            '-o',
            'json',
            '--no-deps',
            parent,
          ])
        )
      )

    // Filter requirements of results info parents of next cycle
    parents = results
      .map((result) => result[0].requires.filter(blacklisted))
      .flat()

    // Push deps
    results.flat().forEach((x) => deps.push(x))
  }

  const resultDeps = deps.slice(1).map((x) => ({
    name: x.name,
    version: x.version_latest_in_spec,
    filename: basename(x.download_link),
    url: x.download_link,
  }))

  await Promise.all(
    resultDeps.map((x) => download(x.url, pathDist, x.filename))
  )

  await writeFile(
    join(pathDist, 'deps.json'),
    JSON.stringify(
      resultDeps.map((x) => ({ name: x.name, filename: x.filename }))
    )
  )
}

register('nbp', (project) =>
  Promise.all([
    ...Object.keys(project.targets)
      .filter((path) => path.startsWith('/plugins'))
      .map(buildPlugin),
    buildNonebot(),
  ])
)
