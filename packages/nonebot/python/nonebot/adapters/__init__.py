class Event:
	def __init__(self, *args, **kwargs) -> None:
		self.type = 'event'
		self.args = args
		self.kwargs = kwargs
		if len(args) > 0:
			self.internal = args[0]
			self.group_id = self.internal.guildId

	def get_type(self):
		return self.internal.type

	def get_event_name(self):
		return self.internal.subtype

	def get_message(self):
		return self.internal.content

	def get_plaintext(self):
		return self.internal.content

	def get_user_id(self):
		return self.internal.userId

	def get_session_id(self):
		return f"{self.internal.userId}:{self.internal.channelId}"
