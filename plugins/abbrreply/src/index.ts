import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'abbrreply'
export const using = ['nonebot']

interface Config {}

export const Config: Schema<Config> = Schema.object({})

export async function apply(ctx: Context) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_abbrreply/nonebot_plugin_abbrreply'))
}
