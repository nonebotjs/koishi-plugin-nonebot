from pyodide.ffi import JsProxy
from internal import h
from nonebot.params import Dependent
from nonebot.adapters import Event as Event
import re
from typing import Iterable, Tuple, Union

from .event import MessageEvent as MessageEvent
from .event import GroupMessageEvent as GroupMessageEvent
from .event import PrivateMessageEvent as PrivateMessageEvent


class Bot(Dependent):
	def __init__(self, *args, **kwargs) -> None:
		self.internal = args[0]
		self.unwrap = args[1]
		self.args = args
		self.kwargs = kwargs

	async def send(self, event: Event, message, at_sender = False):
		if at_sender:
			message = MessageSegment(h('at', {'id': event.get_user_id()})) + message
		if not isinstance(message, str):
			message = ''.join([item.internal.toString() for item in message])
		return event.internal.send(message)

	async def send_group_forward_msg(self, group_id, messages):
		return self.internal.sendMessage(group_id, h('message', {'forward': True}, [self.unwrap(item) for item in messages]))

	async def send_private_forward_msg(self, user_id, messages):
		return self.internal.sendPrivateMessage(user_id, h('message', {'forward': True}, [self.unwrap(item) for item in messages]))

	async def call_api(self, api, *args, **kwargs):
		return getattr(self, api)(*args, **kwargs)

	async def get_friend_list(self):
		return self.internal.getFriendList()

	async def get_group_info(self, group_id):
		return self.internal.getGuild(group_id)

	async def get_group_list(self):
		return self.internal.getGuildList()

	async def get_group_member_info(self, group_id, user_id):
		return self.internal.getGuildMember(group_id, user_id)

	async def get_group_member_list(self, group_id):
		raw = await self.internal.getGuildMemberList(group_id)
		return [{
			'card': '',
			'user_id': member.userId,
			'nickname': member.nickname,
			'last_sent_time': 0,
		} for member in raw]


def escape(s: str, *, escape_comma: bool = True) -> str:
	s = s.replace("&", "&amp;").replace("[", "&#91;").replace("]", "&#93;")
	if escape_comma:
		s = s.replace(",", "&#44;")
	return s


def unescape(s: str) -> str:
	return (
		s.replace("&#44;", ",")
		.replace("&#91;", "[")
		.replace("&#93;", "]")
		.replace("&amp;", "&")
	)


def create_message(list):
	return Message(list)


class Message(list):
	def __init__(self, message) -> None:
		super().__init__()
		if message is None:
			return
		self.append(message)

	def copy(self):
		return Message(self)

	def __add__(self, other: Union[str, 'MessageSegment', Iterable['MessageSegment']]):
		result = self.copy()
		result.append(other)
		return result

	def __radd__(self, other: Union[str, 'MessageSegment', Iterable['MessageSegment']]):
		result = self.__class__(other)
		return result + self

	def __iadd__(self, other: Union[str, 'MessageSegment', Iterable['MessageSegment']]):
		return self.append(other)

	def _construct(self, msg):
		def _iter_message(msg: str) -> Iterable[Tuple[str, str]]:
			text_begin = 0
			for cqcode in re.finditer(
				r"\[CQ:(?P<type>[a-zA-Z0-9-_.]+)"
				r"(?P<params>"
				r"(?:,[a-zA-Z0-9-_.]+=[^,\]]*)*"
				r"),?\]",
				msg,
			):
				yield "text", msg[text_begin : cqcode.pos + cqcode.start()]
				text_begin = cqcode.pos + cqcode.end()
				yield cqcode.group("type"), cqcode.group("params").lstrip(",")
			yield "text", msg[text_begin:]

		for type_, data in _iter_message(msg):
			if type_ == "text":
				if data:
					# only yield non-empty text segment
					yield MessageSegment.text(unescape(data))
			else:
				data = {
					k: unescape(v)
					for k, v in map(
						lambda x: x.split("=", maxsplit=1),
						filter(lambda x: x, (x.lstrip() for x in data.split(","))),
					)
				}
				yield MessageSegment(h(type_, data))

	def append(self, obj):
		if isinstance(obj, MessageSegment):
			super().append(obj)
		elif isinstance(obj, Iterable):
			self.extend(obj)
		elif isinstance(obj, str):
			self.extend(self._construct(obj))
		elif isinstance(obj, JsProxy):
			super().append(MessageSegment(obj))
		else:
			raise ValueError(f"Unexpected type: {type(obj)} {obj}")
		return self

	def extend(self, obj):
		for segment in obj:
			self.append(segment)
		return self

	def extract_plain_text(self) -> str:
		return "".join(str(seg) for seg in self if seg.is_text())


class MessageSegment:
	def __init__(self, element) -> None:
		self.internal = element
		self._type = element.type
		self._data = element.attrs

	def is_text(self) -> bool:
		return self._type == "text"

	def __repr__(self) -> str:
		return self.internal.toString()

	# def __str__(self) -> str:
	# 	return self.internal.toString()

	def __add__(self, other: Union[str, "MessageSegment", Iterable["MessageSegment"]]) -> "Message":
		return Message(self) + (MessageSegment.text(other) if isinstance(other, str) else other)

	def __radd__(self, other: Union[str, "MessageSegment", Iterable["MessageSegment"]]) -> "Message":
		return (MessageSegment.text(other) if isinstance(other, str) else Message(other)) + self

	@staticmethod
	def text(text: str):
		return MessageSegment(h('text', {"content": text}))

	@staticmethod
	def at(id: str):
		return MessageSegment(h('at', {"id": id}))

	@staticmethod
	def reply(id: str):
		return MessageSegment(h('quote', {"id": id}))

	@staticmethod
	def image(file: str, cache: bool = False):
		return MessageSegment(h('image', {"url": file, "cache": cache}))

	@staticmethod
	def music(type: str, id: int):
		return MessageSegment(h('onebot:music', {"type": type, "id": id}))

	@staticmethod
	def node_custom(
		user_id: int, nickname: str, content: Union[str, "Message"]
	) -> "MessageSegment":
		# return MessageSegment(h("node", {"user_id": str(user_id), "nickname": nickname, "content": content}))
		children = Message(content)
		children = [MessageSegment(h('author', {'userId': str(user_id), 'nickname': nickname}))] + children
		return MessageSegment(h('message', {}, children))
