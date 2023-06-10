from typing import Sequence, Protocol

from .jsobject import JSProxyObject, JSObject


class Config(dict):
    pass


class Context(Protocol):
    runtime: JSObject["Context"]
    scope: JSObject["Context"]
    bots: JSObject[Sequence]
    nonebot: JSObject["Service"]
    root: JSObject["Context"]
    config: JSProxyObject[Config]


class Service(Protocol):
    ctx: JSObject[Context]


class ReggolLogger(Protocol):
    def success(self, obj, *args):
        pass

    def error(self, obj, *args):
        pass

    def info(self, obj, *args):
        pass

    def warn(self, obj, *args):
        pass

    def debug(self, obj, *args):
        pass


class NonebotJSLogger(ReggolLogger, Protocol):
    warning = ReggolLogger.warn
