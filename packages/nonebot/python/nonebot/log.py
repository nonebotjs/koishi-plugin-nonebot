import loguru
from loguru import logger

from internal import logger as internal_logger


async def handle(message: "loguru.Message"):
	func = getattr(internal_logger, message.record['level'].name.lower(), internal_logger.info)
	func(message.removesuffix('\n'))


logger.remove()
logger.add(
	handle,
	format="<cyan>{name}</><green>:</><cyan>{function}</> {message}",
	colorize=True,
	diagnose=True
)
