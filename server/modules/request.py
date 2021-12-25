
class Request:
    def __init__(self, data):
        self.data = data
        self.type = None
        self.method = None
        self.uri = None
        self.http_version = '1.1'
        self.sent_data = None
        self.parse()

    #Parsing request
    def parse(self):
        lines = self.data.split(b'\r\n')
        self.type = lines[0]
        self.sent_data = lines[-1].decode()
        words = self.type.split(b' ')
        self.method = words[0].decode()

        if len(words) > 1:
            self.uri = words[1].decode()

        if len(words) > 2:
            self.http_version = words[2]

    #Getting header from request
    def get_header(self, header):
        lines = self.data.split(b'\r\n')
        res = str()
        for line in lines[1:-1]:
            l = line.decode().split(':', 1)
            if l[0] == header:
                res = l[1].strip()

        return res


