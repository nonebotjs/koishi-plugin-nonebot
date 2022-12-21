class T_State:
	def __init__(self, *args, **kwargs):
		self.type = 'state'
		self.args = args
		self.kwargs = kwargs


class State:
	def __init__(self, *args, **kwargs):
		self.type = 'state'
		self.args = args
		self.kwargs = kwargs


class CommandArg:
	def __init__(self, *args, **kwargs):
		self.type = 'message'
		self.args = args
		self.kwargs = kwargs


class ArgStr:
	def __init__(self, *args, **kwargs):
		self.type = 'arg'
		self.args = args
		self.kwargs = kwargs
