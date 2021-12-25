from datetime import datetime
import users
import login
import serve_image
import like
import comment
import search
import follow
import notifications
import poll
import convo
import messages
from modules.response import Response
from modules.request import Request

class HandleResponse:
    def __init__(self, data, addr):
        self.data = data
        self.addr = addr
        self.time = self.get_time()

    def handle(self):
        request = Request(self.data)
        print(f'''[{self.time}] [{self.addr[0]}:{self.addr[1]}]
{request.type.decode()}
        ''')

        if request.uri == '/users':
            if request.method  == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return users.add_user(request)
            elif request.method == 'PUT':
                return users.logout(request)

        elif request.uri == '/get_user':
            if request.method =='OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method =='POST':
                return users.get_user(request)

        elif request.uri == '/search':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return search.get_result(request)

        elif request.uri == '/login':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return login.can_login(request)
        elif request.uri =='/getlogin':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return login.logged_user(request)

        elif request.uri == '/image':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return serve_image.add_image(request)
            elif request.method == 'DELETE':
                return serve_image.delete_image(request)
        elif request.uri == '/getimage':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return serve_image.get_images(request)

        elif request.uri == '/profile':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method ==  'POST':
                return serve_image.profile_images(request)

        elif request.uri =='/oneimage':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return serve_image.one_image(request)

        elif request.uri == '/like':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return like.like(request)
            elif request.method == 'DELETE':
                return like.unlike(request)

        elif request.uri == '/comment':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return comment.add_comment(request)
            elif request.method == 'DELETE':
                return comment.delete_comment(request)

        elif request.uri =='/notifications':
            if request.method == 'OPTIONS':
                response= Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return notifications.seen_notification(request);

        elif request.uri == '/follow':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method =='POST':
                return follow.send_follow(request)

        elif request.uri =='/poll':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return poll.live_data(request)

        elif request.uri =='/convo':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return convo.create_convo(request)
            elif request.method == 'PUT':
                return convo.update_convos(request)
        elif request.uri == '/getconvo':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return convo.get_convos(request)

        elif request.uri =='/messages':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return messages.send_msg(request)
            elif request.method == 'PUT':
                return messages.get_messages(request)
        elif request.uri=='/getmessages':
            if request.method == 'OPTIONS':
                response = Response(204)
                return response.get_response()
            elif request.method == 'POST':
                return messages.check_msg(request)

        elif request.uri:
            if 'images' in request.uri:
                return serve_image.serve(request)
        else:
            response = Response(404)

        response = Response(404)

        return response.get_response()

    def get_time(self):
        now = datetime.now()
        dt = now.strftime('%d/%m/%Y - %H:%M:%S')

        return dt
