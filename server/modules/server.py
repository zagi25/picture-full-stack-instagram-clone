import socket
import threading
import time
from datetime import datetime
from handleresponse import HandleResponse

class Server:
    def __init__(self, host,  port):
        self.host = host
        self.port = port
        self.time = self.get_time()

    def start(self):
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((self.host,self.port))
        server.listen(5)

        print(f"""{self.time}
Starting server at http://{self.host}:{self.port}/
Quit the server with CONTROL-C
              """)

        while True:
            conn, addr = server.accept()
            thread = threading.Thread(target = self.handle_connection, args = (conn, addr))
            thread.start()

    def get_time(self):
        now = datetime.now()
        dt = now.strftime('%d/%m/%Y - %H:%M:%S')
        return dt

    def handle_connection(self, conn, addr):
        BUFFER_SIZE = 8192
        recived_data = list()
        conn.setblocking(0)
        time.sleep(0.3)
        while True:
            try:
                part_of_data = conn.recv(BUFFER_SIZE)
                recived_data.append(part_of_data)
                time.sleep(0.05)
            except socket.error as e:
                break

        data = b''.join(recived_data)
        res = HandleResponse(data, addr)
        data_to_send = res.handle()
        sent_bytes = 0
        while True:
            if sent_bytes < len(data_to_send):
                sent = conn.send(data_to_send[sent_bytes:])
                sent_bytes += sent
            else:
                break
            time.sleep(0.3)

        conn.close()

