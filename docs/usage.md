# 起步

## 快速搭建

为没有使用过 Koishi 的新人提供一份快速搭建指南：

1. [点击这里](https://k.ilharp.cc/win.msi)，下载并安装 Koishi 桌面版
2. 启动桌面版，你将会看到一个控制台界面
3. 前往「插件市场」，搜索「nonebot」，选择任意插件进行下载
4. 前往「插件配置」，配置刚刚下载的插件，并点击右上角的「启用」按钮
5. 现在你已经可以在「沙盒」中使用 NoneBot 插件了！

::: tip
除了 Windows 外，我们也为 [macOS](https://koishi.chat/manual/starter/macos.html)、[Linux](https://koishi.chat/manual/starter/linux.html)、[Android](https://koishi.chat/manual/starter/android.html)、[Docker](https://koishi.chat/manual/starter/docker.html) 用户提供了安装包。此外，开发者也可以直接使用[模板项目](https://koishi.chat/manual/starter/boilerplate.html)完成搭建。
:::

## 接入聊天平台

如果想进一步在 QQ 中使用，可继续进行下列操作：

1. 准备一个 QQ 号 (等级不要过低，否则可能被风控)
2. 点击左侧的「插件配置」，选择「onebot」插件，完成以下配置：
   - 在「selfId」填写你的 QQ 号
   - 在「password」填写你的密码
   - 在「protocol」选择 ws-reverse
   - 开启「gocqhttp.enable」选项
3. 点击右上角的「启用」按钮
4. 现在你可以在 QQ 中使用 NoneBot 插件了！

::: tip
其他平台的接入方式也与之类似，你可以在[这篇文档](https://koishi.chat/manual/console/adapter.html)中了解全部官方支持的平台。
:::

## 配置项

### siteFolder

- 类型：`string`
- 默认值：`'data/nonebot/site-packages'`

site-packages 目录，用于存放下载的 Python 包。
