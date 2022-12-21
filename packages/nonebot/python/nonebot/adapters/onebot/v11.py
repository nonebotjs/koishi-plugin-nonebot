from internal import h
from nonebot.adapters import Event as Event
import re
from typing import Iterable, Tuple


class Bot:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'bot'
		self.internal = args[0]

	async def send(self, event: Event, message, at_sender = False):
		if at_sender:
			message = h.at(event.get_user_id()).toString() + message
		print(message)
		print(isinstance(message, str))
		if not isinstance(message, str):
			message = ''.join([h(item.type, item.attrs).toString() for item in message])
		print(message)
		print(isinstance(message, str))
		return event.internal.send(message)

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


class MessageEvent(Event):
	pass


class GroupMessageEvent(Event):
	pass


class PrivateMessageEvent(Event):
	pass


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


class Message(list):
	def __init__(self, message) -> None:
		super().__init__()
		if message is None:
			return
		elif isinstance(message, str):
			self.extend(self._construct(message))
		elif isinstance(message, MessageSegment):
			self.append(message)
		elif isinstance(message, Iterable):
			self.extend(message)
		else:
			raise ValueError(f"Unexpected type: {type(message)} {message}")

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
		elif isinstance(obj, str):
			self.extend(self._construct(obj))
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
	def __init__(self, el) -> None:
		self.internal = el
		self.type = el.type
		self.data = el.attrs

	def is_text(self) -> bool:
		return self.type == "text"

	@staticmethod
	def text(text: str):
		return MessageSegment(h.text(text))

	@staticmethod
	def at(id: str):
		return MessageSegment(h.at(id))

	@staticmethod
	def reply(id: str):
		return MessageSegment(h.quote(id))()

	@staticmethod
	def image(file: str):
		return MessageSegment(h.image(file))()

	@staticmethod
	def music(type: str, id: int):
		return MessageSegment(h('onebot:music', type=type, id=id))
