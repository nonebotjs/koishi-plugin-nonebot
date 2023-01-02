from pyodide.ffi import JsProxy
from typing import Union, Iterable, Tuple
from internal import h
import re


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
				yield MessageSegment(type_, data)

	def append(self, obj):
		if isinstance(obj, MessageSegment):
			super().append(obj)
		elif isinstance(obj, str):
			self.extend(self._construct(obj))
		elif isinstance(obj, Iterable):
			self.extend(obj)
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
	def __init__(self, element, data = None) -> None:
		if (isinstance(element, str)):
			element = h(element, data)
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
		return MessageSegment('text', {"content": text})

	@staticmethod
	def at(id: str):
		return MessageSegment('at', {"id": id})

	@staticmethod
	def reply(id: str):
		return MessageSegment('quote', {"id": id})

	@staticmethod
	def image(file: str, cache: bool = False):
		return MessageSegment('image', {"url": file, "cache": cache})

	@staticmethod
	def record(file: str, cache: bool = False):
		return MessageSegment('audio', {"url": file, "cache": cache})

	@staticmethod
	def video(file: str, cache: bool = False):
		return MessageSegment('video', {"url": file, "cache": cache})

	@staticmethod
	def music(type: str, id: int):
		return MessageSegment('onebot:music', {"type": type, "id": id})

	@staticmethod
	def node_custom(
		user_id: int, nickname: str, content: Union[str, "Message"]
	) -> "MessageSegment":
		# return MessageSegment("node", {"user_id": str(user_id), "nickname": nickname, "content": content})
		children = Message(content)
		children = [MessageSegment('author', {'userId': str(user_id), 'nickname': nickname})] + children
		return MessageSegment('message', {}, children)
