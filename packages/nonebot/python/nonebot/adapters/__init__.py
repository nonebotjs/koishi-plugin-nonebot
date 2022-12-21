from nonebot.params import Dependent


class Event(Dependent):
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'event'
		self.args = args
		self.kwargs = kwargs
		if len(args) > 0:
			self.internal = args[0]
			self.reply = None
			self.user_id = self.internal.userId
			self.group_id = self.internal.guildId
			self.message = self.internal.content

	def get_type(self):
		return self.internal.type

	def get_event_name(self):
		return self.internal.subtype

	def get_message(self):
		return self.message

	def get_plaintext(self):
		return self.message

	def get_user_id(self):
		return self.user_id

	def get_session_id(self):
		return f"{self.user_id}:{self.group_id}"
