import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'trace-moe'
export const using = ['nonebot']

export interface Config {
  trace_moe_max_ret: number
}

export const Config: Schema<Config> = Schema.object({
  trace_moe_max_ret: Schema.number().default(3).description('最大返回查询结果数。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_trace_moe/nonebot_plugin_trace_moe'), config)
}
