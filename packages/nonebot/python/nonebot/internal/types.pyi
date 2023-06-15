from typing import Sequence, Protocol, Awaitable, Callable, Any

from .jsobject import JSProxyObject, JSObject, JSProxyCallable

import config


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
  config: config


class NonebotService(Service, Protocol):
  loadDep: JSProxyCallable[Awaitable[Callable[[str, dict], None]]]
  install: JSProxyCallable[Awaitable[Callable[[str], None]]]
  installed: JSProxyObject[dict]
  path: JSProxyObject[dict]
  internal: "internal"
  python: Any



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
