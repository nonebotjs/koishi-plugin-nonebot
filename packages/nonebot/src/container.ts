import { loadPyodide, PyodideInterface } from 'pyodide'
import { Context } from 'koishi'
import NoneBotModule from './enviorments'
import fetch from 'node-fetch'

export class NoneBotContainer {
  python: PyodideInterface

  constructor(protected ctx: Context) {

  }

  async start() {

    try {
      //@ts-ignore
      global.fetch = fetch
      this.python = await loadPyodide({
        stdout: this.ctx.logger('nonebot').info,
        stderr: this.ctx.logger('nonebot').error,
      })
      this.python.FS.mkdir('/home/pyodide/nb/')
      this.python.FS.mount(this.python.FS.filesystems.NODEFS, {root: './nonebot-packages'}, '/lib/python3.10/site-packages/')
      this.python.FS.mount(this.python.FS.filesystems.NODEFS, {root: './nonebot'}, '/home/pyodide/nb/')
      this.python.registerJsModule('nonebot', new NoneBotModule(this.ctx, this))
      await this.python.loadPackage(['pydantic', 'micropip'])
      this.python.pyimport('pydantic')
      this.python.pyimport('nonebot')
      this.python.pyimport('nb.nonebot_plugin_biliav.nonebot_plugin_biliav')
    } catch (e) {
      console.error(e)
    }
  }
}
