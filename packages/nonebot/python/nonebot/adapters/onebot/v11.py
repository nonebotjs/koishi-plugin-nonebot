from internal import noop as Message
from internal import Element


class Bot:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'bot'
		self.internal = args[0]

	async def send(self, event, message, at_sender = False):
		if at_sender:
			message = Element.at(event.get_user_id()).toString() + message
		return event.to_koishi().send(message)

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
