import { mkdir } from 'node:fs/promises'
import { Context, Dict, Logger, Schema, Service } from 'koishi'
import { basename, join, resolve } from 'node:path'
import type { PyodideInterface } from 'pyodide'
import { loadPyodide } from 'pyodide'
import * as modules from './modules'

if (!globalThis.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  globalThis.fetch = require('node-fetch')
}

const logger = new Logger('nonebot')

declare module 'koishi' {
  interface Context {
    nonebot: NoneBot
  }
}

interface Dependency {
  name: string
  filename: string
}

class NoneBot extends Service {
  public python: PyodideInterface
  public internal: modules.NoneBot
  private importTask: Promise<void> = Promise.resolve()
  private installed: Dict<Promise<void>> = Object.create(null)

  constructor(protected ctx: Context, protected config: NoneBot.Config) {
    super(ctx, 'nonebot')
  }

  async start() {
    this.python = await loadPyodide({
      stdout: logger.info,
      stderr: logger.warn,
      fullStdLib: false,
      homedir: '/pyodide',
    })

    const root = resolve(this.ctx.baseDir, this.config.packagesFolder)
    await mkdir(root, { recursive: true })
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root },
      '/lib/python3.10/site-packages/'
    )
    this.internal = new modules.NoneBot(this.ctx)
    this.python.registerJsModule('nonebot', this.internal)
    for (const name of ['httpx', 'aiohttp']) {
      this.mount(resolve(__dirname, `../python/${name}`))
    }
  }

  mount(pathModule: string) {
    const name = basename(pathModule)
    const pathVFSModule = `/pyodide/${name}/`
    this.python.FS.mkdirTree(pathVFSModule)
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root: pathModule },
      pathVFSModule
    )
    return name
  }

  async install(pathDeps: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const deps: Dependency[] = require(join(pathDeps, 'deps.json'))
    await Promise.all(deps.map(dep => this.loadPackage(pathDeps, dep)))
  }

  async import(pathModule: string, config = {}) {
    return this.importTask = this.importTask.then(async () => {
      const name = this.mount(pathModule)
      this.internal.config = config
      await this.python.runPython(`import ${name}`)
      this.internal.config = {}
    })
  }

  private async loadPackage(pathDeps: string, dep: Dependency) {
    return this.installed[dep.name] ||= this.python.loadPackage(
      join(pathDeps, dep.filename),
      logger.info,
      logger.warn
    )
  }

  async stop() {
    // TODO
  }
}

namespace NoneBot {
  export interface Config {
    packagesFolder?: string
  }

  export const Config: Schema<Config> = Schema.object({
    packagesFolder: Schema.string()
      .description('site-packages 目录。')
      .default('data/nonebot/site-packages'),
  })
}

export default NoneBot
