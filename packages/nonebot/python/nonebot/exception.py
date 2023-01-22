class NoneBotException(Exception):
  pass


class ProcessException(NoneBotException):
  pass


class IgnoredException(ProcessException):
  pass
