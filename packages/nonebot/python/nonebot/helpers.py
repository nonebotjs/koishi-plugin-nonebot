import inspect
from typing import Callable


class Param:
	def __init__(self, name, kind, key):
		self.name = name
		self.kind = kind
		self.key = key


def get_params(call: Callable):
	return [Param(
		param.name,
		param.kind,
		param.default.type if param.default is not param.empty else None
	) for param in inspect.signature(call).parameters.values()]

