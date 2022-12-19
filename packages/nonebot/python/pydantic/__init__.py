class BaseModel:
	@classmethod
	def parse_obj(cls, obj: dict):
		return Object(obj)

	def __init_subclass__(cls, extra) -> None:
		pass


class Object(dict):
	def __getattr__(self, key):
		if key not in self:
			return None
		else:
			value = self[key]
			if isinstance(value, dict):
				value = Object(value)
			return value


class Extra:
	ignore = 0


def validator(*args, **kwargs):
	def decorator(func):
		return func
	return decorator
