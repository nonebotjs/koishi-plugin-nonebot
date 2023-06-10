import internal

from internal import get_driver as get_driver

from internal import on_message as on_message
from internal import on_command as on_command
from internal import on_shell_command as on_shell_command

from internal import on_keyword as on_keyword
from internal import on_regex as on_regex
from internal import on_fullmatch as on_fullmatch

from internal import on_notice as on_notice
from internal import on_request as on_request
from internal import on_metaevent as on_metaevent

from internal import on_startswith as on_startswith
from internal import on_endswith as on_endswith

from .adapters.onebot.v11 import Bot

from .log import logger as logger


def require(*args, **kwargs):
    pass


def get_bot(*args, **kwargs):
    return Bot(internal.ctx.bots[0], internal.unwrap)


def get_bots(*args, **kwargs):
    bots = {}
    for bot in internal.ctx.bots:
        bots[bot.selfId] = Bot(bot, internal.unwrap)
    return bots


logger.success("nonebot loaded")
