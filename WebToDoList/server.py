import http.server
import socketserver
import json
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs

PORT = 8001
DATA_DIR = 'data'

class TodoHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/save-markdown':
            content_length = int(self.headers['Content-Length'])
            post_data = self.read_json(content_length)

            filename = post_data.get('filename', '')
            content = post_data.get('content', '')

            if not filename:
                filename = f"todo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

            if not filename.endswith('.md'):
                filename += '.md'

            filepath = os.path.join(DATA_DIR, filename)

            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'success': True, 'filepath': filepath}
                self.wfile.write(json.dumps(response).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'success': False, 'error': str(e)}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/api/files':
            try:
                files = os.listdir(DATA_DIR)
                files = [f for f in files if f.endswith('.md')]
                files.sort(reverse=True)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(files).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def read_json(self, content_length):
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))

if __name__ == '__main__':
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    with socketserver.TCPServer(("", PORT), TodoHandler) as httpd:
        print(f"服务器运行在 http://localhost:{PORT}")
        httpd.serve_forever()