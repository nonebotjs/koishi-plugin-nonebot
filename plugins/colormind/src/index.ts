import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'colormind'
export const using = ['nonebot', 'nonebot.htmlrender']

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-colormind/nonebot_plugin_colormind'), config)
}
