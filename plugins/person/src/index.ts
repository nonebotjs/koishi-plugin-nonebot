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
  person_show_avatar: Schema.boolean().default(true),
  person_extra_messages: Schema.array(String).default([]),
  person_extra_messages_overwrite: Schema.boolean().default(false),
  person_at: Schema.boolean().default(false),
  person_choose_last: Schema.boolean().default(false),
  person_choose_last_time: Schema.number().default(2592000),
  person_check_last: Schema.boolean().default(false),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-person/nonebot-plugin-person'), config)
}
