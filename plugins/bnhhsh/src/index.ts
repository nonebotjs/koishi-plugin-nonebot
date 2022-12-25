import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'bnhhsh'
export const using = ['nonebot']

export interface Config {
  bnhhsh_unv_mse: number
}

export const Config: Schema<Config> = Schema.object({
  bnhhsh_unv_mse: Schema.number().default(0.2).description('unvcode 的字符串不同阈值 (如 0.2 则会匹配 80% 相似度以上的字符)。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-bnhhsh/nonebot_plugin_bnhhsh'), config)
}
