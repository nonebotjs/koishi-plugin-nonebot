import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-nonebot'
import { resolve } from 'path'

export const name = 'crazy-thursday'
export const using = ['nonebot']

export interface Config {
  crazy_path: string
}

export const Config: Schema<Config> = Schema.object({
  crazy_path: Schema.string()
    .description('读取文案的路径 (相对于插件源码目录)。')
    .default(''),
})

export async function apply(ctx: Context, config: Config) {
  const { Path } = ctx.nonebot.python.pyimport('pathlib')
  const srcPath = resolve(__dirname, '../nonebot_plugin_crazy_thursday/nonebot_plugin_crazy_thursday')
  const tmpPath = ctx.nonebot.mountTemp(resolve(srcPath, config.crazy_path))
  await ctx.nonebot.install(resolve(__dirname, '../dist'))
  await ctx.nonebot.import(srcPath, {
    crazy_path: Path(tmpPath),
  })
}
