import * as fs from 'node:fs/promises'
import { Context, Dict, Logger, Schema, Service, sleep } from 'koishi'
import { basename, join, resolve } from 'node:path'
import type { PyodideInterface } from 'pyodide'
import { loadPyodide } from 'pyodide'
import { Internal } from './internal'

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
  public internal: Internal

  private paths: Dict<string> = Object.create(null)
  private importTask: Promise<void> = Promise.resolve()
  private installed: Dict<Promise<void>> = Object.create(null)

  constructor(protected ctx: Context, protected config: NoneBot.Config) {
    super(ctx, 'nonebot')
  }

  async start() {
    this.internal = new Internal(this.ctx)
    this.python = await loadPyodide({
      stdout: logger.info,
      stderr: logger.warn,
      fullStdLib: false,
      homedir: '/pyodide',
    })

    const root = resolve(this.ctx.baseDir, this.config.siteFolder)
    await fs.mkdir(root, { recursive: true })
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root },
      '/lib/python3.10/site-packages/',
    )

    await this.install(resolve(__dirname, '../dist'))

    this.python.registerJsModule('internal', this.internal)

    for (const name of ['aiohttp', 'httpx', 'nonebot', 'pydantic']) {
      this.mountModule(resolve(__dirname, `../python/${name}`))
    }

    // workaround ModuleNotFoundError: No module named 'nonebot_plugin_xxx'
    await sleep(1000)
  }

  resolvePath(path: string) {
    for (const [prefix, root] of Object.entries(this.paths)) {
      if (!path.startsWith(prefix)) continue
      return join(root, path.slice(prefix.length))
    }
    return path
  }

  mountTree(root: string, pathVFS: string) {
    this.paths[pathVFS] = root
    this.python.FS.mkdirTree(pathVFS)
    this.python.FS.mount(
      this.python.FS.filesystems.NODEFS,
      { root },
      pathVFS,
    )
  }

  mountTemp(path: string) {
    const id = Math.random().toString(36).slice(2)
    const pathVFS = `/tmp/${id}/`
    this.mountTree(path, pathVFS)
    return pathVFS
  }

  mountModule(pathModule: string) {
    const name = basename(pathModule).replace(/-/g, '_')
    const pathVFSModule = `/pyodide/${name}/`
    this.mountTree(pathModule, pathVFSModule)
    return name
  }

  async install(base: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const deps: Dependency[] = require(join(base, 'deps.json'))
    await Promise.all(deps.map((dep) => {
      return this.installed[dep.name] ||= this.loadDep(base, dep)
    }))
  }

  async import(pathModule: string, config?: {}) {
    const name = this.mountModule(pathModule)
    const caller = this.caller
    return this.importTask = this.importTask.then(async () => {
      this.internal.caller = caller
      this.internal.config = config
      await this.python.runPythonAsync(`
      from nonebot import logger
      from importlib import __import__
      logger.catch(lambda: __import__('''${name}'''))()
      `)
      this.internal.caller = null
      this.internal.config = null
    })
  }

  private async loadDep(base: string, dep: Dependency) {
    const filename = join(base, dep.filename)
    const stats = await fs.stat(filename)
    if (stats.isDirectory()) {
      this.mountModule(filename)
    } else {
      await this.python.loadPackage(filename, logger.info, logger.warn)
    }
  }

  async stop() {
    // TODO
  }
}

namespace NoneBot {
  export interface Config {
    siteFolder?: string,
    backtrace: boolean
  }

  export const Config: Schema<Config> = Schema.object({
    siteFolder: Schema.string()
      .description('site-packages 目录。')
      .default('data/nonebot/site-packages'),
    backtrace: Schema.boolean()
        .description('向前追踪错误')
        .default(false),
    colorize: Schema.boolean()
        .description('输出彩色日志')
        .default(true),
    diagnose: Schema.boolean()
        .description('日志错误诊断')
        .default(false),
  })
}

export default NoneBot
