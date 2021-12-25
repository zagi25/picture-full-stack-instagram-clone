import os
import json
import hashlib
import time
from modules.sql_execute import sql_execute
from modules.response import Response
from modules import functions


def add_user(request):
    data = json.loads(request.sent_data)
    sql = f"SELECT * FROM users WHERE username='{data['username']}'"
    myresult = sql_execute(sql, 'check')
    if not myresult:
        cookie = dict()
        token = functions.create_token()
        now = time.time()
        encoded_password = data['password'].encode()
        hashed_password = hashlib.sha256(encoded_password).hexdigest()
        sql1 = f"INSERT INTO users(username, password, token, status, created_at) VALUES('{data['username']}','{hashed_password}', '{token}', 'online', {now})"
        sql_execute(sql1, 'change')
        sql_img = f"SELECT user_id FROM users WHERE username='{data['username']}'"
        myresult1 = sql_execute(sql_img, 'check')
        os.mkdir(f'images/{myresult1[0][0]}')
        os.mkdir(f'images/{myresult1[0][0]}/profile')
        os.mkdir(f'images/{myresult1[0][0]}/images')
        if data['img']:
            path = f'images/{myresult1[0][0]}/profile/{myresult1[0][0]}'
            image = functions.image_save(path, data['img'])
            sql_save_img = "UPDATE users SET profile_picture = '%s' WHERE user_id = '%s'" % (image, myresult1[0][0])
            sql_execute(sql_save_img,  'change')
        response = Response(201, data_type='application/json', data = json.dumps(token))
    else:
        response = Response(400)

    return response.get_response()

def get_user(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql = "SELECT user_id, username, profile_picture FROM users WHERE username='%s'" % (data['username'])
        user = sql_execute(sql,'get')
        if user:
            follow_status = functions.is_following(token, user[0]['user_id'])
            if follow_status:
                user[0]['follow_status'] = follow_status
            else:
                user[0]['follow_status'] = str()

            sql1=f"SELECT followed FROM follow WHERE follower='{user[0]['user_id']}' AND status='following'"
            following=sql_execute(sql1, 'get')
            sql2=f"SELECT follower FROM follow WHERE followed='{user[0]['user_id']}' AND status='following'"
            followers=sql_execute(sql2, 'get')
            user[0]['followers'] = len(followers)
            user[0]['following'] = len(following)

        response = Response(200, data_type='application/json', data = json.dumps(user))
    else:
        response = Response(401)

    return response.get_response()

def logout(request):
    is_valid, token = functions.is_valid(request)
    if is_valid == 'True':
        sql=f"UPDATE users SET status='offline', token=NULL WHERE token='{token}'"
        sql_execute(sql, 'change')

        response = Response(200)
    else:
        response = Response(401)

    return response.get_response()

