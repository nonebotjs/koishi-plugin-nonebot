from pyodide.http import pyfetch

class ClientSession:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return self

	def post(url, headers, data):
		return Response(pyfetch(url, headers=headers, data=data))

class Response:
	def __init__(self, response):
		self._response = response

	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return self

	async def json(self):
		return await self._response.json()
