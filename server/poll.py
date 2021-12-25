import json
import time
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions

#Long polling
def live_data(request):
    is_valid, token, data= functions.is_valid(request)
    if is_valid == 'True':
        user = functions.loggedUser(token)
        now = data['now']
        result = dict()
        count = 0
        while count < 20 :
            sql_check = f"SELECT status FROM users WHERE user_id='{user['user_id']}'"
            status_check = sql_execute(sql_check, 'get')
            if status_check[0]['status'] == 'online':
                #Checking for new notifications
                sql_not = f"SELECT * FROM notifications WHERE reciver={user['user_id']} AND created_at>{now}"
                notifications = sql_execute(sql_not, 'get')

                #Checking for new messages
                sql_convo = f"SELECT convo_id, status FROM convo WHERE (user1='{user['user_id']}' OR user2='{user['user_id']}') AND status!='{user['user_id']}' AND updated_at>{now}"
                convo_id = sql_execute(sql_convo, 'get')

                #Checking for new images from users that you follow
                sql_follow = f"SELECT followed FROM follow WHERE follower='{user['user_id']}' AND status='following'"
                res_follow = sql_execute(sql_follow, 'get')
                followed = [r['followed'] for r in res_follow]

                if followed:
                    sql_post = "SELECT * FROM post WHERE user_id IN (%s) AND created_at>'%s' ORDER BY created_at DESC" % (','.join(map(str, followed)), now)
                    images = sql_execute(sql_post, 'get')
                    if images:
                        for r in images:
                            sql1 = "SELECT username, profile_picture FROM users WHERE user_id='%s'" % (r['user_id'])
                            result1 = sql_execute(sql1, 'get')
                            sql2 = "SELECT user_id FROM likes WHERE post_id='%s'" % (r['post_id'])
                            likes = sql_execute(sql2, 'get')
                            sql3 = "SELECT * FROM comments WHERE post_id=%s ORDER BY created_at DESC" % (r['post_id'])
                            comments = sql_execute(sql3, 'get')
                            for comment in comments:
                                sql4 = "SELECT username, profile_picture FROM users WHERE user_id=%s" %(comment['user_id'])
                                comment_owner = sql_execute(sql4, 'get')
                                comment['owner_username'] = comment_owner[0]['username']
                                comment['owner_profile'] = comment_owner[0]['profile_picture']
                                del comment['user_id']
                                del comment['post_id']
                            r['username'] = result1[0]['username']
                            r['profile_picture'] = result1[0]['profile_picture']
                            r['likes'] = [i['user_id'] for i in likes]
                            r['comments'] = comments

                        result['images'] = images

                if notifications:
                    for n in notifications:
                        sql_notU = f"SELECT username FROM users WHERE user_id='{n['sender']}'"
                        resultU = sql_execute(sql_notU, 'get')
                        n['sender'] = resultU[0]['username']
                        sql_notI = f"SELECT image_path FROM post WHERE post_id='{n['post_id']}'"
                        resultI = sql_execute(sql_notI, 'get')
                        if resultI:
                            n['img'] = resultI[0]['image_path']
                    result['notifications'] = notifications

                if convo_id:
                    if convo_id[0]['status'] != 0:
                        result['messages'] = list()
                        now_msg = now
                        count=0
                        while True:
                            time.sleep(0.5)
                            sql_msg = f"SELECT * FROM messages WHERE convo_id='{convo_id[0]['convo_id']}' AND reciver='{user['user_id']}' AND created_at>{now_msg}"
                            messages = sql_execute(sql_msg, 'get')
                            if messages:
                                now_msg = messages[-1]['created_at']
                                for m in messages:
                                    result['messages'].append(m)
                            else:
                                break
                    else:
                        result['seen_message'] = [convo_id[0]['convo_id'], now]


                if bool(result):
                    break

            else:
                break

            count += 1

            time.sleep(2)

        response = Response(200, data_type='application/json', data= json.dumps(result))

    else:
        response = Response(401)

    return response.get_response()
