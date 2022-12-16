import { Context } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'biliav'
export const using = ['nonebot']

export function apply(ctx: Context) {
  ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_biliav'))
}
