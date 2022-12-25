import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'today-in-history'
export const using = ['nonebot']

export interface Config {
  history_qq_friends: number[]
  history_qq_groups: number[]
  history_inform_time: string
}

export const Config: Schema<Config> = Schema.object({
  history_qq_friends: Schema.array(Number).description('设定要发送的 QQ 好友。'),
  history_qq_groups: Schema.array(Number).description('设定要发送的群。'),
  history_inform_time: Schema.string().description('设定每天发送时间，以空格间隔。').default('7 35'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-today-in-history/nonebot_plugin_today_in_history'), config)
}
