from internal import noop as Message
from internal import Element


class Bot:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'bot'


class Event:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'event'


class MessageEvent:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'event'


class GroupMessageEvent:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'event'


class PrivateMessageEvent:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'event'


class MessageSegment:
	@staticmethod
	def text(text: str):
		return text

	@staticmethod
	def at(id: str):
		return Element.at(id).toString()

	@staticmethod
	def reply(id: str):
		return Element.quote(id).toString()

	@staticmethod
	def image(file: str):
		return Element.image(file).toString()

	@staticmethod
	def music(type: str, id: int):
		return Element('onebot:music', type=type, id=id).toString()
