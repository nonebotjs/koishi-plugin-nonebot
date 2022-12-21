import inspect
from typing import Callable


class Param:
	def __init__(self, kind, name, args=None, kwargs=None):
		self.kind = kind
		self.name = name
		self.args = args
		self.kwargs = kwargs


def get_params(call: Callable):
	return [Param(
		param.kind,
		param.default.__class__.__name__ if param.default is not param.empty else param.annotation.__name__,
		param.default.args if param.default is not param.empty else [],
		param.default.kwargs if param.default is not param.empty else {},
	) for param in inspect.signature(call).parameters.values()]

