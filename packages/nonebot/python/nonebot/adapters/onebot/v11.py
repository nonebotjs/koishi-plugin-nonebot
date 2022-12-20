from internal import noop as Bot
from internal import noop as Event
from internal import noop as MessageEvent
from internal import noop as GroupMessageEvent
from internal import noop as PrivateMessageEvent
from internal import noop as Message
from internal import Element


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
