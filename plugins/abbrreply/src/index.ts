import type { Context } from 'koishi'
import type {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'abbrreply'
export const using = ['nonebot']

export function apply(ctx: Context) {
  ctx.nonebot.import(
    resolve(__dirname, '../nonebot_plugin_abbrreply/nonebot_plugin_abbrreply'),
    resolve(__dirname, '../dist')
  )
}
