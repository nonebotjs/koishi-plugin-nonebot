from _htmlrender import ctx
from js import Object
from pyodide.ffi import to_js


class get_new_page():
  async def __aenter__(self):
    self.page = await ctx.puppeteer.page()
    return self

  async def __aexit__(self, exc_type, exc_value, traceback):
    await self.page.close()
    return

  def __init__(self, viewport={}):
    pass

  async def set_content(self, html):
    await self.page.setContent(html)

  async def screenshot(self, full_page=False):
    base64 = await self.page.screenshot(to_js({
      'encoding': 'base64',
    }, dict_converter=Object.fromEntries))
    return "data:image/png;base64," + base64
