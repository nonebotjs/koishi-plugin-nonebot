from internal import h
from nonebot.params import Dependent
from nonebot.adapters import Event as Event
from nonebot.internal.adapter import escape as escape
from nonebot.internal.adapter import unescape as unescape
from nonebot.internal.adapter import Message as Message
from nonebot.internal.adapter import MessageSegment as MessageSegment

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


def create_message(list):
	return Message(list)

