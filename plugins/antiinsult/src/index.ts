import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'antiinsult'
export const using = ['nonebot']

export interface Config {
  superusers: string[]
}

export const Config: Schema<Config> = Schema.object({
  superusers: Schema.array(String),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot-plugin-antiinsult/nonebot_plugin_antiinsult'), config)
}
