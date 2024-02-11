import webbrowser
import http.server
import socketserver


port = 8000
openURLPath = '/testing/test.html'


class RequestHandler(http.server.SimpleHTTPRequestHandler):
  extensions_map = {
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.css':	'text/css',
    '.js':	'text/javascript',
    '': 'application/octet-stream'
  }

  def end_headers(self):
    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    self.send_header('Pragma', 'no-cache')
    self.send_header('Expires', '0')

    super().end_headers()


if __name__ == '__main__':
  with socketserver.TCPServer(('', port), RequestHandler) as httpd:
    openURL = f'http://localhost:{port}{openURLPath}'
    print(f'Opening in browser {openURL}')
    webbrowser.open_new_tab(openURL)

    print(f'Serving at port {port}')
    httpd.serve_forever()