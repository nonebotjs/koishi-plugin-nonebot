"""本模块包含了所有 NoneBot 运行时可能会抛出的异常。
这些异常并非所有需要用户处理，在 NoneBot 内部运行时被捕获，并进行对应操作。
```bash
NoneBotException
├── ParserExit
├── ProcessException
|   ├── IgnoredException
|   ├── SkippedException
|   |   └── TypeMisMatch
|   ├── MockApiException
|   └── StopPropagation
├── MatcherException
|   ├── PausedException
|   ├── RejectedException
|   └── FinishedException
├── AdapterException
|   ├── NoLogException
|   ├── ApiNotAvailable
|   ├── NetworkError
|   └── ActionFailed
└── DriverException
    └── WebSocketClosed
```
"""


class NoneBotException(Exception):
  pass


class ParserExit(NoneBotException):
	pass


class ProcessException(NoneBotException):
  pass


class IgnoredException(ProcessException):
  pass


class SkippedException(ProcessException):
  pass


class TypeMisMatch(SkippedException):
  pass


class MockApiException(ProcessException):
  pass


class StopPropagation(ProcessException):
  pass


class MatcherException(NoneBotException):
  pass


class PausedException(MatcherException):
  pass


class RejectedException(MatcherException):
  pass


class FinishedException(MatcherException):
  pass


class AdapterException(NoneBotException):
  pass


class NoLogException(AdapterException):
  pass


class ApiNotAvailable(AdapterException):
  pass


class NetworkError(AdapterException):
  pass


class ActionFailed(AdapterException):
  pass
