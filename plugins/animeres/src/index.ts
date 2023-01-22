import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'animeres'
export const using = ['nonebot']

export interface Config {
  cartoon_proxy: string
  cartoon_forward: boolean
  cartoon_length: number
  cartoon_format: string
  cartoon_oneskip: boolean
}

export const Config: Schema<Config> = Schema.object({
  cartoon_proxy: Schema.string().description('设置代理端口。'),
  cartoon_forward: Schema.boolean().default(false).description('合并转发的形式发送消息。'),
  cartoon_length: Schema.number().default(3).description('每次发送的数量，用 `-1` 表示全部取出。'),
  cartoon_format: Schema.string().default('{title}\n{magnet}').description('发送的消息格式化。'),
  cartoon_oneskip: Schema.boolean().default(true).description('当只有一个选项时跳过。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_animeres/nonebot_plugin_animeres'), config)
}
