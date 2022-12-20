import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'person'
export const using = ['nonebot']

export interface Config {
  nickname: string[]
  person_show_avatar: boolean
  person_extra_messages: string[]
  person_extra_messages_overwrite: boolean
  person_at: boolean
  person_choose_last: boolean
  person_choose_last_time: number
  person_check_last: boolean
}

export const Config: Schema<Config> = Schema.object({
  nickname: Schema.array(String).default(['Bot']),
  person_show_avatar: Schema.boolean().default(true).description('是否显示头像。'),
  person_extra_messages: Schema.array(String).default([]).description('自定义文案。`{name}` 会替换成 Bot 昵称，`{person}` 会替换成抽到的人的信息，没有这两项依然能展示。'),
  person_extra_messages_overwrite: Schema.boolean().default(false).description('自定义文案是否覆盖已有文案。'),
  person_at: Schema.boolean().default(false).description('是否 at 随人对象，将会替换 QQ 号放在消息结尾。'),
  person_choose_last: Schema.boolean().default(false).description('是否仅抽取最近发言的群友。'),
  person_choose_last_time: Schema.number().default(2592000).description('最近发言时间范围 (秒)。'),
  person_check_last: Schema.boolean().default(false).description('日志打印，用于检查群友最近发言时间。'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-person/nonebot-plugin-person'), config)
}
