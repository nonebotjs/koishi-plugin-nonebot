import type { Context } from 'koishi'
import type {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'songpicker2'
export const using = ['nonebot']

export function apply(ctx: Context) {
  ctx.nonebot.import(
    resolve(__dirname, '../nonebot_plugin_songpicker2/nonebot_plugin_songpicker2'),
    resolve(__dirname, '../dist')
  )
}
