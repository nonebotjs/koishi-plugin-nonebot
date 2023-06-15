from nonebot import logger, on_command


class SomethingWentWrongError(Exception):
	pass


logger.debug('test [debug]')
logger.warning('test [warning]')
logger.info('test [info]')
logger.error('test [error]')

logger.info('message with {}', 'format string')
logger.info('message with {kwargs1}', kwargs1='keyword argument')
logger.info('message with {dict1}', dict1={
	"with": 'dict',
	"foo": 'bar'
})

logger.opt(colors=True).info('message with <yellow>colored</> <cyan>text</cyan>')
logger.opt(colors=True).info('message with <fg #AFFFAF>hex</> <bg>color</>')
logger.opt(colors=True).info('message with <green>also</> <bg cyan>color</>')


@logger.catch
def func_that_raise_error():
	raise SomethingWentWrongError("Hey, what happened?")


exc_matcher = on_command('exc')


@exc_matcher.handle()
def exc():
	exc_matcher.send(f'Is going to raise a {SomethingWentWrongError.__name__}')
	raise SomethingWentWrongError(
		"There is something wrong with this command, "
		"absolutely not manually raised"
	)
