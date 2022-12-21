from pyodide.http import pyfetch
import json


def request(method, url, data={}, headers={}, timeout=60000):
	return ClientSession().request(method, url, data, headers, timeout)


class ClientSession:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	def request(self, method, url, data={}, headers={}, timeout=60000):
		headers["Content-Type"] = "application/json"
		kwargs = {"method": method, "headers": headers}
		if method != "GET" and method != "HEAD":
			kwargs["body"] = json.dumps(data)
		return ResponseWrapper(pyfetch(url, **kwargs))

	def get(self, url, headers={}, timeout=60000):
		return self.request("GET", url, headers=headers, timeout=timeout)

	def post(self, url, headers={}, data={}, timeout=60000):
		return self.request("POST", url, headers=headers, data=data, timeout=timeout)


class ResponseWrapper:
	def __init__(self, response):
		self._response = response
		self.content = self

	async def __await__(self):
		return self

	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	async def read(self):
		r = await self._response
		return ResponseText(await r.string())

	async def json(self):
		r = await self._response
		return await r.json()


class ResponseText:
	def __init__(self, text):
		self.text = text

	def decode(self):
		return self.text


class Client:
	def ClientTimeout(self, timeout: int):
		return timeout


client = Client()
