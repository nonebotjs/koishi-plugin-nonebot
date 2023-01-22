import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'baidutranslate'
export const using = ['nonebot']

export interface Config {
  appid: string
  key: string
  salt: string
}

export const Config: Schema<Config> = Schema.object({
  appid: Schema.string().description('你的 APP ID，在百度翻译的开发者中心里可以找到。'),
  key: Schema.string().description('你的密钥，在百度翻译的开发者中心里可以找到。'),
  salt: Schema.string().description('随机字符串。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_baidutranslate/nonebot_plugin_baidutranslate'), config)
}
