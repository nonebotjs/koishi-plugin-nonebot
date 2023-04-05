import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'wordsnorote'
export const using = ['nonebot']

export interface Config {
  num_words: number
  resources_dir: string
}

export const Config: Schema<Config> = Schema.object({
  num_words: Schema.number().description('每日单词数量。').default(20),
  resources_dir: Schema.string().description('数据存储目录。').default('data'),
})

export async function apply(ctx: Context, config: Config) {
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(resolve(__dirname, '../nonebot_plugin_wordsnorote/nonebot_plugin_wordsnorote'), config)
}
