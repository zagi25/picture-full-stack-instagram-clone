from http import HTTPStatus
from datetime import datetime

class Response:
    def __init__(self, status_code, data_type = 'text/html', extra_headers = None, data = None  ):
        self.status_code = status_code
        self.data_type = data_type
        self.extra_headers = extra_headers
        self.data = data


    def status_line(self):
        line = f'HTTP/1.1 {HTTPStatus(self.status_code).value} {HTTPStatus(self.status_code).phrase}\r\n'

        return line.encode()


    def response_headers(self):
        now = datetime.now()
        time = now.strftime('%d/%m/%Y  %H:%M:%S')
        headers = {
            'Server': 'RatkoServer',
            'Content-Type': self.data_type,
            'Date': time,
            # 'Access-Control-Allow-Origin': 'http://192.168.1.25:3000',
            # 'Access-Control-Allow-Origin': 'https://picture-client-side.herokuapp.com',
            'Access-Control-Allow-Origin': '*',
            # 'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT,OPTIONS',
            'Access-Control-Max-Age': 86400,
            'Connection': 'Keep-Alive',
            'Keep-Alive': 'timeout=5, max=100',
            'X-Requested-With': 'XMLHttpRequest',
        }
        headers_copy = headers.copy()

        if self.extra_headers:
            headers_copy.update(self.extra_headers)

        headers = ''

        for h in headers_copy:
            headers += f'{h}:{headers_copy[h]}\r\n'

        return headers.encode()

    def get_response(self):
        status_line = self.status_line()
        headers = self.response_headers()
        blank_line = b'\r\n'
        if not self.data:
            return b''.join([status_line, headers, blank_line])
        else:
            if type(self.data) is bytes:
                return b''.join([status_line, headers, blank_line, self.data])
            else:
                return b''.join([status_line, headers, blank_line, self.data.encode()])
