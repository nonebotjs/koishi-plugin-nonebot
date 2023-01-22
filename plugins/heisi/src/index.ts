import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'heisi'
export const using = ['nonebot']

export interface Config {
  heisi_group: string[]
  heisi_cd: number
}

export const Config: Schema<Config> = Schema.object({
  heisi_group: Schema.array(String).description('黑丝白名单。'),
  heisi_cd: Schema.number().description('黑丝冷却时间 (秒)。').default(60),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_heisi/nonebot_plugin_heisi'), config)
}
