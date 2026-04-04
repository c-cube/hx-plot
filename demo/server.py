#!/usr/bin/env python3
import json
import math
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler


SINE_PATH = '/sine'


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == SINE_PATH:
            t = time.time()
            data = [{"x": round(i * 0.1, 2), "y": round(math.sin(i * 0.2 + t), 4)}
                    for i in range(64)]
            body = json.dumps({
                "mark": "line",
                "data": {"values": data},
                "encoding": {
                    "x": {"field": "x", "type": "quantitative", "axis": {"title": None}},
                    "y": {"field": "y", "type": "quantitative", "scale": {"domain": [-1.2, 1.2]}}
                },
                "height": 200
            }).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def log_message(self, fmt, *args):
        # suppress /sine noise in the terminal
        if SINE_PATH not in args[0]:
            super().log_message(fmt, *args)


if __name__ == '__main__':
    print('Serving at http://localhost:8000/demo/demo.html')
    HTTPServer(('', 8000), Handler).serve_forever()
