import json
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

	async def post(self, url, headers={}, data={}, cookies={}):
		if cookies:
			headers['Cookie'] = '; '.join([f'{k}={v}' for k, v in cookies.items()])
		r = await pyfetch(url, method="POST", body=json.dumps(data), headers=headers)
		text = await r.string()
		return Response(text)


class Response:
	def __init__(self, text):
		self.text = text

	def json(self):
		return json.loads(self.text)
