from pyodide.http import pyfetch


class ClientSession:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	def get(self, url, headers, data):
		return ResponseWrapper(pyfetch(url, headers=headers, data=data, method="GET"))

	def post(self, url, headers, data):
		return ResponseWrapper(pyfetch(url, headers=headers, data=data, method="POST"))


class ResponseWrapper:
	def __init__(self, response):
		self._response = response

	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	async def json(self):
		r = await self._response
		return await r.json()
