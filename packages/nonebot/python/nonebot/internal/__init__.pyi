from typing import Any

from .jsobject import JSProxyObject, JSProxyCallable, JSObject
from .types import *


def on_message(*args, **kwargs):  # real signature unknown
    pass


def on_metaevent(*args, **kwargs):  # real signature unknown
    pass


def on_notice(*args, **kwargs):  # real signature unknown
    pass


def on_request(*args, **kwargs):  # real signature unknown
    pass


def on_regex(*args, **kwargs):  # real signature unknown
    pass


def on_keyword(*args, **kwargs):  # real signature unknown
    pass


def on_endswith(*args, **kwargs):  # real signature unknown
    pass


def on_fullmatch(*args, **kwargs):  # real signature unknown
    pass


def on_startswith(*args, **kwargs):  # real signature unknown
    pass


def on_command(*args, **kwargs):  # real signature unknown
    pass


def on_shell_command(*args, **kwargs):  # real signature unknown
    pass


def get_driver(*args, **kwargs):  # real signature unknown
    pass


logger: JSObject[NonebotJSLogger]
unwrap: JSProxyCallable[[Any], Any]
ctx: JSObject[Context]
