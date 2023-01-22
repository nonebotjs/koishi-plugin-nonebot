class Dependent:
	def __init__(self, *args, **kwargs):
		self.args = args
		self.kwargs = kwargs


class T_State(Dependent):
	pass


class State(Dependent):
	pass


class CommandArg(Dependent):
	pass


class ShellCommandArgs(Dependent):
	pass


class ShellCommandArgv(Dependent):
	pass


class ArgStr(Dependent):
	pass


class ArgPlainText(Dependent):
	pass


class RegexDict(Dependent):
	pass


class RegexGroup(Dependent):
	pass


class RegexMatched(Dependent):
	pass


class Depends(Dependent):
	pass
