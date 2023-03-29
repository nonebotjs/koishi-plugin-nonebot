import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'phlogo'
export const using = ['nonebot']

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-phlogo/nonebot_plugin_phlogo'), {
    PHLOGO_FONT: '/pyodide/nonebot_plugin_phlogo/resource/font.ttf',
  })
}
