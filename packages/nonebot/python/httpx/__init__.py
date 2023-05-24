from json import dumps, loads
from urllib.parse import urlencode
from pyodide.http import pyfetch
from js import String, Uint8Array


class AsyncClient:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	async def get(self, url, params={}, headers={}, cookies={}):
		url += '?' + urlencode(params)
		if cookies:
			headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
		r = await pyfetch(url, method="GET", headers=headers)
		buffer = await r.buffer()
		return Response(r, buffer)

	async def post(self, url, params={}, headers={}, data=None, json=None, cookies={}):
		url += '?' + urlencode(params)
		if cookies:
			headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
		r = await pyfetch(url, method="POST", body=dumps(data or json), headers=headers)
		buffer = await r.buffer()
		return Response(r, buffer)


class Headers:
	def __init__(self, internal):
		self.internal = internal

	def get(self, key):
		return self.internal.get(key)


class Response:
	def __init__(self, r, buffer):
		self.headers = Headers(r.js_response.headers)
		self.status_code = int(r.status)
		self.content_type = self.headers.get('Content-Type')
		try:
			self.text = String.fromCharCode.apply(None, Uint8Array.new(buffer))
		except:
			pass
		self.content = buffer.to_bytes()
		self.is_error = self.status_code >= 400

	def json(self):
		return loads(self.text)


def get(url, headers={}, cookies={}):
	if cookies:
		headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
	return AsyncResponse(pyfetch(url, method="GET", headers=headers))


def post(url, headers={}, data=None, json=None, cookies={}):
	if cookies:
		headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
	return AsyncResponse(pyfetch(url, method="POST", body=dumps(data or json), headers=headers))


class AsyncResponse:
	def __init__(self, ar):
		self.ar = ar

	async def json(self):
		r = await self.ar
		text = await r.string()
		return loads(text)
