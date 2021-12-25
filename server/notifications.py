import json
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions

def get_notifications(request):
    check = functions.is_valid(request)
    if check[0] == 'True':
        sql = f"SELECT user_id FROM users WHERE token='{check[1]}'"
        user_id = sql_execute(sql, 'get')
        sql2= f"SELECT * FROM notifications WHERE reciver='{user_id[0]['user_id']} AND status=0'  ORDER BY created_at DESC"
        notifications = sql_execute(sql2, 'get')
        for n in notifications:
            sql_notU = f"SELECT username FROM users WHERE user_id='{n['sender']}'"
            resultU = sql_execute(sql_notU, 'get')
            n['sender'] = resultU[0]['username']
            sql_notI = f"SELECT image_path FROM post WHERE post_id='{n['post_id']}'"
            resultI = sql_execute(sql_notI, 'get')
            if resultI:
                n['img'] = resultI[0]['image_path']

        response = Response(200, data_type='application/json', data = json.dumps(notifications))
    else:
        response = Response(401)

    return response.get_response()

def seen_notification(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid =='True':
        sql = f"UPDATE notifications SET status=1 WHERE notif_id={data['id']}"
        sql_execute(sql, 'change')

        response = Response(200)
    else:
        response = Response(404)

    return response.get_response()
