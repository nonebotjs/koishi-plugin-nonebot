import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'ygo'
export const using = ['nonebot']

export interface Config {
  ygo_max: number
}

export const Config: Schema<Config> = Schema.object({
  ygo_max: Schema.number().default(10).description('最大查询卡数。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_ygo/nonebot_plugin_ygo'), config)
}
