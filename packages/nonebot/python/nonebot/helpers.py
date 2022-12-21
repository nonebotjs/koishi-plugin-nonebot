import inspect
from typing import Callable


class Param:
	def __init__(self, name, kind, type, args):
		self.name = name
		self.kind = kind
		self.type = type
		self.args = args


def get_params(call: Callable):
	return [Param(
		param.name,
		param.kind,
		param.default.type if param.default is not param.empty else None,
		param.default.args if param.default is not param.empty else None,
	) for param in inspect.signature(call).parameters.values()]

