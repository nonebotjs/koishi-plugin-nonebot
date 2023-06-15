import { createWriteStream } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { finished } from 'node:stream'
import { promisify } from 'node:util'
import { extract } from 'tar'
import bz2 from 'unbzip2-stream'
import { register } from 'yakumo'
import { loguruSource, nameLoguru, nameNumpy, namePil, pyodideSource } from './config'
import { download, exists, spawnOutput } from './utils'

const blacklist = [
  'nonebot-adapter-onebot',
  'nonebot-plugin-apscheduler',
  'nonebot-plugin-htmlrender',
  'nonebot2',
  'httpx',
  'aiohttp',
  'pydantic',
  'build',
  'twine',
  'pil',
  'pillow',
  'numpy',
  'loguru',
  'setuptools',
]

interface JohnnydepItem {
  name: string
  version_latest_in_spec: string
  download_link: string
  requires: string[]
}

function skip(name: string, blacklist: string[]) {
  name = name
    .split('[')[0]
    .split('<')[0]
    .split('>')[0]
    .split('=')[0]
    .split('!')[0]
    .toLowerCase()
    .replace(/_/g, '-')
  return !blacklist.some((y) => name === y.toLowerCase().replace(/_/g, '-'))
}

const preparePyodide = async () => {
  const pathCache = resolve(__dirname, '../build/cache')
  await mkdir(pathCache, { recursive: true })

  const pathExtracted = join(pathCache, 'pyodide')
  await mkdir(pathExtracted, { recursive: true })

  if (!await exists(join(pathExtracted, 'pyodide.js'))) {
    const stream = await download(pyodideSource)
    await promisify(finished)(stream.pipe(bz2()).pipe(extract({ cwd: pathExtracted, strip: 1 })))
  }

  if (!await exists(join(pathExtracted, nameLoguru))) {
    const stream = await download(loguruSource)
    await promisify(finished)(stream.pipe(createWriteStream(join(pathExtracted, nameLoguru))))
  }

  return pathExtracted
}

const buildNonebot = async () => {
  const pathPyodide = await preparePyodide()

  const pathPackage = resolve(__dirname, '../packages/nonebot')
  const pathDist = join(pathPackage, 'dist')

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })

  await Promise.all(
    [
      // namePyyaml,
      namePil,
      nameNumpy,
      nameLoguru,
    ].map((x) => cp(join(pathPyodide, x), join(pathDist, x))),
  )

  await writeFile(
    join(pathDist, 'deps.json'),
    JSON.stringify([
      // {
      //   name: 'yaml',
      //   filename: namePyyaml,
      // },
      {
        name: 'PIL',
        filename: namePil,
      },
      {
        name: 'numpy',
        filename: nameNumpy,
      },
      {
        name: 'loguru',
        filename: nameLoguru,
      },
    ]),
  )
}

const buildPlugin = async (path: string) => {
  const pathPackage = resolve(__dirname, `..${path}`)
  const pathDist = join(pathPackage, 'dist')

  if (await exists(pathDist)) return
  await mkdir(pathDist, { recursive: true })

  // Parents of each cycle
  const { name, version, exclude = [] } = JSON.parse(await readFile(join(pathPackage, 'nbp.json'), 'utf-8'))
  let parents = [`${name}==${version}`]
  // Finally collected deps
  const deps: JohnnydepItem[] = []

  while (parents.length) {
    // Collected results
    const results: JohnnydepItem[][] = []

    // Collect
    for (const parent of parents) {
      results.push(JSON.parse(await spawnOutput('python', [
        '-m',
        'johnnydep',
        '-f',
        'ALL',
        '-o',
        'json',
        '--no-deps',
        parent,
      ])))
    }

    // Filter requirements of results info parents of next cycle
    parents = results
      .map((result) => result[0].requires.filter(x => skip(x, [...blacklist, ...exclude])))
      .flat()

    // Push deps
    for (const result of results.flat()) {
      const conflictedIndex = deps.findIndex((x) => x.name === result.name)
      if (conflictedIndex === -1) {
        deps.push(result)
        continue
      }

      const conflicted = deps[conflictedIndex]
      const versions_available: string[] = JSON.parse(
        await spawnOutput('python', [
          '-m',
          'johnnydep',
          '-f',
          'versions_available',
          '-o',
          'json',
          '--no-deps',
          result.name,
        ]),
      )[0].versions_available

      const selected
        = versions_available.indexOf(conflicted.version_latest_in_spec)
        > versions_available.indexOf(result.version_latest_in_spec)
          ? conflicted
          : result
      deps.splice(conflictedIndex, 1, selected)
    }
  }

  const resultDeps = deps.slice(1).map((x) => ({
    name: x.name,
    version: x.version_latest_in_spec,
    filename: x.download_link.endsWith('.tar.gz') ? x.name : basename(x.download_link),
    url: x.download_link,
  }))

  await Promise.all(resultDeps.map(async (x) => {
    const stream = await download(x.url)
    if (!x.url.endsWith('.tar.gz')) {
      return promisify(finished)(stream.pipe(createWriteStream(join(pathDist, x.filename))))
    }
    await mkdir(pathDist, { recursive: true })
    await promisify(finished)(stream.pipe(extract({
      cwd: pathDist,
      newer: true,
      strip: 1,
      filter(path) {
        if (!path.endsWith('/')) return true
        const segments = path.split(/\//g)
        return segments[1] === x.name
      },
    })))
  }))

  await writeFile(
    join(pathDist, 'deps.json'),
    JSON.stringify(
      resultDeps.map((x) => ({ name: x.name, filename: x.filename })),
    ),
  )
}

register('nbp', (project) => {
  const tasks = Object
    .keys(project.targets)
    .filter(path => path.startsWith('/plugins') && !path.includes('_template'))
    .map(buildPlugin)
  tasks.push(buildNonebot())
  return Promise.all(tasks)
})
