import os
import http.server
import socketserver


port = 8000
handler = http.server.SimpleHTTPRequestHandler

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", port), handler) as httpd:
    print(f"Serving at port {port}")

    httpd.serve_forever()
