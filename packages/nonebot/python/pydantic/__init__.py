from pyodide.ffi import JsProxy


class BaseModel:
	@classmethod
	def parse_obj(cls, obj: dict):
		return Object(obj)

	def __init__(self, *args, **kwargs):
		pass

	def __init_subclass__(cls, extra = None) -> None:
		pass


class Object(dict):
	def __getattr__(self, key):
		if key not in self:
			return None
		value = self[key]
		if isinstance(value, JsProxy):
			value = value.to_py()
		if isinstance(value, dict):
			value = Object(value)
		return value


class BaseSettings(Object):
	pass


class Extra:
	ignore = 0


def validator(*args, **kwargs):
	def decorator(func):
		return func
	return decorator
