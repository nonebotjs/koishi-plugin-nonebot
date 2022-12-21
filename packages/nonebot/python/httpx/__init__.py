from json import dumps, loads
from pyodide.http import pyfetch


class AsyncClient:
	async def __aenter__(self):
		return self

	async def __aexit__(self, exc_type, exc_value, traceback):
		return

	async def get(self, url, headers={}, cookies={}):
		if cookies:
			headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
		r = await pyfetch(url, method="GET", headers=headers)
		text = await r.string()
		return Response(text)

	async def post(self, url, headers={}, data=None, json=None, cookies={}):
		if cookies:
			headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
		r = await pyfetch(url, method="POST", body=dumps(data or json), headers=headers)
		text = await r.string()
		return Response(r, text)


class Response:
	def __init__(self, r, text):
		self.status_code = int(r.status)
		self.text = text

	def json(self):
		return loads(self.text)
