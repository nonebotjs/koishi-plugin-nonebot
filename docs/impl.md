# 原理

koishi-plugin-nonebot 主要由三个部分组成：

- pyodide 提供了 Python 运行环境
- 由 Koishi 实现了 NoneBot 的大部分 API
- 一部分 Python 代码，用于模拟常见依赖的行为

对于插件所需的 Python 依赖，我们将其分为三种方式实现：

- 由 koishi-plugin-nonebot 模拟，包括 aiohttp, httpx, nonebot, pydantic 等
- 由 koishi-plugin-nonebot 自带，包括 numpy, pillow, jieba 等
- 剩下的插件将打包在插件中，随插件安装
