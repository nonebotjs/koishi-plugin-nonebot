import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'reborn'
export const using = ['nonebot', 'nonebot.htmlrender']

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_reborn/nonebot_plugin_reborn'), config)
}
