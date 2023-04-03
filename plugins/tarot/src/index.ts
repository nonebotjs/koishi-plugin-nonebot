import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'tarot'
export const using = ['nonebot']

export interface Config {
  tarot_path: string
  chain_reply: boolean
  tarot_auto_update: boolean
  nickname: string
}

export const Config: Schema<Config> = Schema.object({
  tarot_path: Schema.string()
    .description('读取文案的路径 (相对于插件源码目录)。')
    .default('resource'),
  chain_reply: Schema.boolean()
    .description('是否使用合并转发。')
    .default(true),
  tarot_auto_update: Schema.boolean()
    .description('是否自动更新资源。')
    .default(false),
  nickname: Schema.string()
    .description('合并转发时使用的昵称。')
    .default('Bot'),
})

export async function apply(ctx: Context, config: Config) {
  const { Path } = ctx.nonebot.python.pyimport('pathlib')
  const srcPath = resolve(__dirname, '../nonebot_plugin_tarot/nonebot_plugin_tarot')
  const tmpPath = ctx.nonebot.mountTemp(resolve(srcPath, config.tarot_path))
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(srcPath, {
    ...config,
    tarot_path: Path(tmpPath),
    tarot_official_themes: ['BilibiliTarot', 'TouhouTarot'],
  })
}
