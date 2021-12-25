import json
import time
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions

def create_convo(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        now = time.time()
        sql_convo = f"INSERT INTO convo(user1, user2, status, created_at, updated_at) VALUES('{data['sender']}', '{data['reciver']}', '{data['sender']}', {now}, {now})"
        sql_execute(sql_convo, 'change')

        sql_convoid = f"SELECT convo_id FROM convo WHERE user1='{data['sender']}' AND user2='{data['reciver']}'"
        convo_id = sql_execute(sql_convoid, 'get')

        if "'" in data['content']:
            a = data['content'].replace("'", "''")
            data['content'] = a 
        sql_msg = f"INSERT INTO messages(sender, reciver, convo_id, content, created_at) VALUES('{data['sender']}', '{data['reciver']}', '{convo_id[0]['convo_id']}', '{data['content']}', {now})"
        sql_execute(sql_msg, 'change')

        response = Response(200, data_type='application/json', data = json.dumps(convo_id[0]))

    else:
        response = Response(403)

    return response.get_response()

def get_convos(request):
    is_valid, token = functions.is_valid(request)
    if is_valid == 'True':
        user = functions.loggedUser(token)
        sql = f"SELECT * FROM convo WHERE user1='{user['user_id']}' OR user2='{user['user_id']}' ORDER BY updated_at DESC"
        res = sql_execute(sql, 'get')

        for r in res:
            sql_msg = f"SELECT * FROM messages WHERE convo_id='{r['convo_id']}' ORDER BY created_at DESC LIMIT 20"
            messages = sql_execute(sql_msg, 'get')
            messages = messages[::-1]
            if r['user1'] is not user['user_id']:
                second_user = r['user1']
            else:
                second_user = r['user2']
            sql_su = f"SELECT username, profile_picture FROM users WHERE user_id='{second_user}'"
            res_su = sql_execute(sql_su, 'get')
            r['username'] = res_su[0]['username']
            r['user_img'] = res_su[0]['profile_picture']
            r['messages'] = messages

        response = Response(200, data_type='application/json', data = json.dumps(res))

    else:
        response = Response(403)

    return response.get_response()

#Update conversation to seen
def update_convos(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        seen = time.time()
        sql_msg = f"UPDATE convo SET status=0, updated_at='{seen}' WHERE convo_id='{data['convo_id']}'"
        sql_execute(sql_msg, 'change')

        response = Response(200)

    else:
        response = Response(403)

    return response.get_response()

