import json
import time
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions


def send_msg(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        now = time.time()
        if "'" in data['content']:
            a = data['content'].replace("'", "''")
            data['content'] = a
        sql_msg = f"INSERT INTO messages(convo_id, sender, reciver, content, created_at) VALUES('{data['convo_id']}', '{data['sender']}', '{data['reciver']}','{data['content']}', {now})"
        sql_execute(sql_msg, 'change')
        sql_convo = f"UPDATE convo SET status='{data['sender']}', updated_at='{now}' WHERE convo_id='{data['convo_id']}'"
        sql_execute(sql_convo, 'change')

        response = Response(200)

    else:
        response = Response(401)

    return response.get_response()

#Check for new messages
def check_msg(request):
    is_valid, token = functions.is_valid(request)
    if is_valid == 'True':
        user = functions.loggedUser(token)
        sql_check = f"SELECT * FROM convo WHERE (user1='{user['user_id']}' OR user2='{user['user_id']}') AND status!=0 AND status!='{user['user_id']}'"
        res = sql_execute(sql_check, 'get')
        if res:
            response = Response(200, data_type='application/json', data=json.dumps({'new_msg': True}))
        else:
            response = Response(200, data_type='application/json', data=json.dumps({'new_msg': False}))

    else:
        response = Response(401)

    return response.get_response()

#Lazy loading messages
def get_messages(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql = f"SELECT * FROM messages WHERE convo_id='{data['convo_id']}' ORDER BY msg_id DESC LIMIT {data['num']}, 20"
        messages = sql_execute(sql, 'get')

        response = Response(200, data_type='application/json', data=json.dumps(messages[::-1]))

    else:
        response = Response(401)

    return response.get_response()
