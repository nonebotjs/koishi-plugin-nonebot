from typing import Protocol

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
