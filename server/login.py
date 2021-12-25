import json
import hashlib
from modules.sql_execute import sql_execute
from modules.response import Response
from modules import functions


def can_login(request):
    data = json.loads(request.sent_data)

    username = data['username'].strip()
    encoded_password = data['password'].encode()
    hashed_password = hashlib.sha256(encoded_password).hexdigest()

    sql = f"SELECT * FROM users WHERE username='{username}' AND password='{hashed_password}'"
    myresult = sql_execute(sql, 'get')
    if myresult and len(myresult) == 1:
        token = functions.create_token()
        sql1 = f"UPDATE users SET token='{token}',status='online' WHERE user_id='{myresult[0]['user_id']}'"
        sql_execute(sql1, 'change')

        response = Response(200, data_type='application/json', data = json.dumps(token))
    else:
       response = Response(401)

    return response.get_response()

#Logged user data
def logged_user(request):
    is_valid, token= functions.is_valid(request)
    if is_valid == 'True':
        sql = f"SELECT user_id, username, profile_picture FROM users WHERE token='{token}'"
        send_data = sql_execute(sql,'get')
        sql1 = f"SELECT * FROM notifications WHERE reciver='{send_data[0]['user_id']}' ORDER BY created_at DESC"
        notifications = sql_execute(sql1,'get')
        for n in notifications:
            sql_notU = f"SELECT username FROM users WHERE user_id='{n['sender']}'"
            resultU = sql_execute(sql_notU, 'get')
            n['sender'] = resultU[0]['username']
            sql_notI = f"SELECT image_path FROM post WHERE post_id='{n['post_id']}'"
            resultI = sql_execute(sql_notI, 'get')
            if resultI:
                n['img'] = resultI[0]['image_path']
        send_data[0]['notifications'] = notifications

        response = Response(200, data_type = 'application/json', data = json.dumps(send_data))
    else:
        response = Response(401)

    return response.get_response()
