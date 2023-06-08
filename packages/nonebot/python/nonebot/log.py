from internal import logger as internal_logger
from loguru import logger

import logging

logger.remove()
logger.add(internal_logger.info, format="<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - {message}")

class LoguruHandler(logging.Handler):  # pragma: no cover
	"""logging 与 loguru 之间的桥梁，将 logging 的日志转发到 loguru。"""

	def emit(self, record: logging.LogRecord):
		try:
			level = logger.level(record.levelname).name
		except ValueError:
			level = record.levelno

		frame, depth = logging.currentframe(), 2
		while frame and frame.f_code.co_filename == logging.__file__:
			frame = frame.f_back
			depth += 1

		logger.opt(depth=depth, exception=record.exc_info).log(
			level, record.getMessage()
		)
