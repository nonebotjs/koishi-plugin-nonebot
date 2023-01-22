from pyodide.http import pyfetch
import json


ClientConnectorError = Exception


def TCPConnector(ssl=False):
	pass


def request(method, url, data={}, headers={}, timeout=60000):
	return ClientSession().request(method, url, data, headers, timeout)


class ClientSession:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	def __init__(self, base_url="", connector=None, trust_env=False):
		self.base_url = base_url
		self.connector = connector
		self.trust_env = trust_env

	def request(self, method, url, data={}, headers={}, timeout=60000):
		headers["Content-Type"] = "application/json"
		kwargs = {"method": method, "headers": headers}
		if method != "GET" and method != "HEAD":
			kwargs["body"] = json.dumps(data)
		return ResponseWrapper(pyfetch(self.base_url + url, **kwargs))

	def get(self, url, headers={}, timeout=60000):
		return self.request("GET", self.base_url + url, headers=headers, timeout=timeout)

	def post(self, url, headers={}, data={}, timeout=60000):
		return self.request("POST", self.base_url + url, headers=headers, data=data, timeout=timeout)


class ResponseWrapper:
	def __init__(self, response):
		self._response = response
		self.content = self

	def __await__(self):
		yield
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
