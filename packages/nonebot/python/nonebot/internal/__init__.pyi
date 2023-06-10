from typing import Protocol, Callable, Any, Dict, Sequence

class Context(Protocol):
    runtime: "Context"
    scope: "Context"
    bots: Sequence
    nonebot: "Context"
    root: "Context"

class Service(Protocol):
    ctx: Context

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

logger: NonebotJSLogger
unwrap: Callable[[Any], Any]
config: Dict | Any
caller: "Context"
