from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add cache-busting headers
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, NoCacheHandler)
    print(f'Starting development server on port {port}...')
    print('Press Ctrl+C to stop')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        httpd.server_close() 