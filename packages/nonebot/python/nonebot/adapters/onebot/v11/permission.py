from nonebot.permission import Permission
from .event import GroupMessageEvent, PrivateMessageEvent


async def _private(event: PrivateMessageEvent) -> bool:
	return event.type == "private"
		

async def _group(event: GroupMessageEvent) -> bool:
	return event.type == "group"


PRIVATE: Permission = Permission(_private)
GROUP: Permission = Permission(_group)
