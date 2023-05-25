from internal import logger as logger

import logging

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
