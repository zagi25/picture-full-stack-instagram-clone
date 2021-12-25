import json
import time
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions


def add_comment(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        now = time.time()
        if "'" in data['content']:
            a = data['content'].replace("'", "''")
            data['content'] = a
        sql = "INSERT INTO comments(content, post_id, user_id, created_at) VALUES('%s', %s, %s, %s)" % (data['content'], data['post_id'], data['user_id'], now)
        sql_execute(sql, 'change')

        sql1 = f"SELECT MAX(comment_id) FROM comments WHERE post_id={data['post_id']}"
        comm_id = sql_execute(sql1, 'get')

        if data['user_id'] is not data['reciver']:
            sql1 = f"INSERT INTO notifications(notif_type, sender, reciver, post_id, status, created_at) VALUES('{data['type']}', {data['user_id']}, {data['reciver']},{data['post_id']}, 0, {now})"
            sql_execute(sql1, 'change')
        sql = f"SELECT user_id FROM comments WHERE post_id={data['post_id']}"
        result = sql_execute(sql,'get')
        users = [r['user_id'] for r in result]
        unique_users = list(set(users))
        unique_users1 = [user for user in unique_users if user != data['user_id'] and user != data['reciver']]
        if unique_users1:
            for user in unique_users1:
                sql1 = f"INSERT INTO notifications(notif_type, sender, reciver, post_id, status, created_at) VALUES('comment_also', {data['user_id']}, {user},{data['post_id']}, 0, {now})"
                sql_execute(sql1,'change')

        response = Response(200, data_type='application/json', data = json.dumps(comm_id[0]['MAX(comment_id)']))
    else:
        response = Response(403)

    return response.get_response()


def delete_comment(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql = f"DELETE FROM comments WHERE comment_id='{data['comment_id']}'"
        sql_execute(sql, 'change')

        response = Response(200)

    else:
        response = Response(403)

    return response.get_response()
























