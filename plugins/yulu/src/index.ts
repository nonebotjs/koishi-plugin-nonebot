import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'yulu'
export const using = ['nonebot']

export interface Config {
  yulu_on_group: string[]
}

export const Config: Schema<Config> = Schema.object({
  yulu_on_group: Schema.array(String).description('配置开启群号。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-yulu/nonebot_plugin_yulu'), config)
}
