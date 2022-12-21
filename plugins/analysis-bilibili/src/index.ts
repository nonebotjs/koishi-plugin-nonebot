import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'analysis-bilibili'
export const using = ['nonebot']

export interface Config {
  analysis_blacklist: number[]
  analysis_display_image: boolean
}

export const Config: Schema<Config> = Schema.object({
  analysis_blacklist: Schema.array(Number).default([]).description('不解析里面填写的 QQ 号发的链接。'),
  analysis_display_image: Schema.boolean().default(false).description('是否显示封面。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_analysis_bilibili/nonebot_plugin_analysis_bilibili'), config)
}
