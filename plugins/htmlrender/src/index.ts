import { Context, Schema, Service } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import {} from 'koishi-plugin-puppeteer'
import { resolve } from 'path'

declare module 'koishi' {
  interface Context {
    'nonebot.htmlrender': HTMLRender
  }
}

class HTMLRender extends Service {
  constructor(ctx: Context, private config: HTMLRender.Config) {
    super(ctx, 'nonebot.htmlrender')
  }

  async start() {
    await this.ctx.nonebot.install(resolve(__dirname, '../dist'))
    this.ctx.nonebot.python.registerJsModule('_htmlrender', this)
    this.ctx.nonebot.mountModule(resolve(__dirname, '../nonebot-plugin-htmlrender/nonebot_plugin_htmlrender'))
  }
}

namespace HTMLRender {
  export const using = ['nonebot', 'puppeteer']

  export interface Config {}

  export const Config: Schema<Config> = Schema.object({})
}

export default HTMLRender
