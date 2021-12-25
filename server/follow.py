import json
import time
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions


def send_follow(request):
    is_valid, token , data = functions.is_valid(request)
    if is_valid == 'True':
        now = time.time()
        if data['follow_status'] == 'request_sent':
            sql = f"INSERT INTO follow(follower, followed, status) VALUES({data['follower']}, {data['followed']}, '{data['follow_status']}')"
            sql_execute(sql, 'change')
            sql1 = f"INSERT INTO notifications(notif_type, sender, reciver, status, created_at) VALUES('follow', {data['follower']}, {data['followed']}, 0, {now})"
            sql_execute(sql1, 'change')

        elif data['follow_status'] == 'following':
            sql = f"UPDATE follow SET status='following' WHERE follower={data['follower']} AND followed={data['followed']}"
            sql_execute(sql,'change')
            sql1 = f"INSERT INTO notifications(notif_type, sender, reciver, status,created_at) VALUES('follow_accept', {data['followed']}, {data['follower']}, 0, {now})"
            sql_execute(sql1, 'change')
            sql2 = f"UPDATE notifications SET notif_type='following_you' , status=1 WHERE sender='{data['follower']}' AND reciver='{data['followed']}'"
            sql_execute(sql2, 'change')

        elif data['follow_status'] == '':
            sql = f"DELETE FROM follow WHERE follower={data['follower']} AND followed={data['followed']}"
            sql_execute(sql,'change')

        response = Response(200)
    else:
        response = Response(403)

    return response.get_response()
