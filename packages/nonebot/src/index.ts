import { Context, Schema, Service } from 'koishi'
import { loadPyodide, PyodideInterface } from 'pyodide'
import * as modules from './modules'

declare module 'koishi' {
  interface Context {
    nonebot: NoneBotRuntime
  }
}

export const name = 'nonebot'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export class NoneBotRuntime extends Service {
  python: PyodideInterface

  constructor(protected ctx: Context) {
    super(ctx, 'nonebot')
  }

  async start() {
    this.python = await loadPyodide({
      stdout: this.ctx.logger('nonebot').info,
      stderr: this.ctx.logger('nonebot').error,
    })
    this.python.FS.mkdir('/home/pyodide/nb/')
    this.python.FS.mount(this.python.FS.filesystems.NODEFS, {root: './nonebot-packages'}, '/lib/python3.10/site-packages/')
    this.python.FS.mount(this.python.FS.filesystems.NODEFS, {root: './nonebot'}, '/home/pyodide/nb/')
    this.python.registerJsModule('nonebot', new modules.NoneBot(this.ctx))
    await this.python.loadPackage(['pydantic', 'micropip'])
    this.python.pyimport('pydantic')
    this.python.pyimport('nonebot')
  }
}
