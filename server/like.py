import json
import time
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions


def like(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        now = time.time()
        sql = f"INSERT INTO likes(user_id, post_id) VALUES('{data['user_id']}', '{data['post_id']}')"
        sql_execute(sql,'change')
        if data['user_id'] is not data['reciver']:
            sql1 = f"INSERT INTO notifications(notif_type, sender, reciver, post_id, status, created_at) VALUES('{data['type']}', '{data['user_id']}', '{data['reciver']}','{data['post_id']}', 0, {now})"
            sql_execute(sql1, 'change')

        response = Response(200)
    else:
        response = Response(401)

    return response.get_response()

def unlike(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql = f"DELETE FROM likes WHERE user_id='{data['user_id']}' AND post_id='{data['post_id']}'"
        sql_execute(sql,'change')
        sql1 = f"DELETE FROM notifications WHERE sender='{data['user_id']}' AND post_id={data['post_id']} AND notif_type='{data['type']}'"
        sql_execute(sql1, 'change')

        response = Response(200)
    else:
        response = Response(401)

    return response.get_response()
