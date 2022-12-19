import { Context, Schema } from 'koishi'
import type {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'biliav'
export const using = ['nonebot']

interface Config {
  b_comments?: boolean
}

export const Config: Schema<Config> = Schema.object({
  b_comments: Schema.boolean().description('是否显示评论。').default(true),
})

export function apply(ctx: Context, config: Config) {
  ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_biliav/nonebot_plugin_biliav'), config)
}
