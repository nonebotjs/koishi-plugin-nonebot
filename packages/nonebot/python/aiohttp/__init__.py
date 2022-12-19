from pyodide.http import pyfetch
import json


class ClientSession:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	def get(self, url, headers, data):
		headers["Content-Type"] = "application/json"
		return ResponseWrapper(pyfetch(url, headers=headers, body=json.dumps(data), method="GET"))

	def post(self, url, headers, data):
		headers["Content-Type"] = "application/json"
		return ResponseWrapper(pyfetch(url, headers=headers, body=json.dumps(data), method="POST"))


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
