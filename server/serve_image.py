import os
import string
import random
import json
import mimetypes
import time
from modules.sql_execute import sql_execute
from modules.response import Response
from modules import functions

#Serving image from server
def serve(request):
    filename = request.uri.strip('/')
    if os.path.exists(filename):
        with open(filename, 'rb') as f:
            res_body = f.read()
        content_type = mimetypes.guess_type(filename)[0] or 'text/html'
        response = Response(200, data_type = content_type, data = res_body)
    else:
        response = Response(404)

    return response.get_response()

def add_image(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        now = time.time()
        user = functions.loggedUser(token)
        img_num = ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k = 5))
        path = f'images/{user["user_id"]}/images/{user["user_id"]}_{img_num}'
        image = functions.image_save(path, data['img'])
        if "'" in data['desc']:
            a = data['desc'].replace("'", "''")
            data['desc'] = a
        sql_save = f"INSERT INTO post(description, image_path, user_id, created_at) VALUES('{data['desc']}', '{image}', '{user['user_id']}', {now})"
        sql_execute(sql_save, 'change')

        response = Response(200)
    else:
        response = Response(401)

    return response.get_response()

def delete_image(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql = f"DELETE FROM post WHERE post_id='{data['post_id']}'"
        sql_execute(sql, 'change')
        sql_n = f"DELETE FROM notifications WHERE post_id='{data['post_id']}'"
        sql_execute(sql_n, 'change')
        sql_l = f"DELETE FROM likes WHERE post_id='{data['post_id']}'"
        sql_execute(sql_n, 'change')
        sql_c = f"DELETE FROM comments WHERE post_id='{data['post_id']}'"
        sql_execute(sql_c, 'change')
        if os.path.exists(data['image_path'].strip('/')):
            os.remove(data['image_path'].strip('/'))

        response = Response(200)

    else:
        response = Reponse(401)

    return response.get_response()

#Getting images for home page
def get_images(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql_user = f"SELECT user_id FROM users WHERE token='{token}'"
        res_user = sql_execute(sql_user, 'get')
        user = res_user[0]['user_id']
        sql_follow = f"SELECT followed FROM follow WHERE follower={user} AND status='following'"
        res_follow = sql_execute(sql_follow, 'get')
        followed = [r['followed'] for r in res_follow]
        if followed:
            sql_post = "SELECT * FROM post WHERE user_id IN (%s) ORDER BY created_at DESC LIMIT '%s', 10" % (','.join(map(str, followed)), data['numImg'])
            result = sql_execute(sql_post, 'get')
            for r in result:
                sql1 = "SELECT username, profile_picture FROM users WHERE user_id='%s'" % (r['user_id'])
                result1 = sql_execute(sql1, 'get')
                sql2 = "SELECT user_id FROM likes WHERE post_id='%s'" % (r['post_id'])
                likes = sql_execute(sql2, 'get')
                sql3 = "SELECT * FROM comments WHERE post_id=%s ORDER BY created_at DESC" % (r['post_id'])
                comments = sql_execute(sql3, 'get')
                for comment in comments:
                    sql4 = "SELECT username FROM users WHERE user_id=%s" %(comment['user_id'])
                    comment_owner = sql_execute(sql4, 'get')
                    comment['owner_username'] = comment_owner[0]['username']
                r['username'] = result1[0]['username']
                r['profile_picture'] = result1[0]['profile_picture']
                r['likes'] = [i['user_id'] for i in likes]
                r['comments'] = comments
            response = Response(200, data_type='application/json', data = json.dumps(result))
        else:
            response = Response(200, data_type='application/json', data = json.dumps([]))
    else:
        response = Response(401)

    return response.get_response()

#Getting images for profile page
def profile_images(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        sql = "SELECT user_id, profile_picture FROM users WHERE username='%s'" % (data[0]['username'])
        result = sql_execute(sql, 'get')
        if result:
            follow_status = functions.is_following(token , result[0]['user_id'])
            if follow_status:
                if follow_status == 'following' or follow_status == 'followingF' or follow_status == 'same'  or follow_status == 'request_recivedF' :
                    sql_img = "SELECT * FROM post WHERE user_id='%s' ORDER BY created_at DESC LIMIT %s, 10" % (result[0]['user_id'], data[1]['numImg'])
                    res = sql_execute(sql_img, 'get')
                    for r in res:
                        sql1 = "SELECT user_id FROM likes WHERE post_id='%s'" % (r['post_id'])
                        likes = sql_execute(sql1, 'get')
                        sql3 = "SELECT * FROM comments WHERE post_id=%s ORDER BY created_at DESC" % (r['post_id'])
                        comments = sql_execute(sql3, 'get')
                        for comment in comments:
                            sql4 = "SELECT username, profile_picture FROM users WHERE user_id=%s" %(comment['user_id'])
                            comment_owner = sql_execute(sql4, 'get')
                            comment['owner_username'] = comment_owner[0]['username']
                            comment['owner_profile'] = comment_owner[0]['profile_picture']
                            del comment['user_id']
                            del comment['post_id']
                        r['profile_picture'] = result[0]['profile_picture']
                        r['username'] = data[0]['username']
                        r['likes'] = [i['user_id'] for i in likes]
                        r['comments'] = comments
                    response = Response(200, data_type='application/json', data=json.dumps(res))
                else:
                    response = Response(200, data_type='application/json', data=json.dumps([]))
            else:
                response = Response(200, data_type='application/json', data=json.dumps([]))
        else:
            response = Response(200, data_type='application/json', data=json.dumps([]))
    else:
        response = Response(401)

    return response.get_response();

def one_image(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        try:
            int(data[1])
            follow_status = functions.is_following(token, data[1])
            if follow_status == 'same' or follow_status == 'following' or follow_status == 'followingF':
                sql = f"SELECT * FROM post WHERE image_path='{data[0]}'"
                result = sql_execute(sql, 'get')
                sql1 = f"SELECT username, profile_picture FROM users WHERE user_id={result[0]['user_id']}"
                result1 = sql_execute(sql1, 'get')
                result[0]['username'] = result1[0]['username']
                result[0]['profile_picture'] = result1[0]['profile_picture']
                sql2 = f"SELECT user_id FROM likes WHERE post_id={result[0]['post_id']}"
                result_likes = sql_execute(sql2, 'get')
                result[0]['likes'] = [i['user_id'] for i in result_likes]
                sql3 = f"SELECT * FROM comments WHERE post_id={result[0]['post_id']} ORDER BY created_at DESC"
                comments = sql_execute(sql3, 'get')
                for comment in comments:
                    sql4 = "SELECT username, profile_picture FROM users WHERE user_id=%s" %(comment['user_id'])
                    comment_owner = sql_execute(sql4, 'get')
                    comment['owner_username'] = comment_owner[0]['username']
                    comment['owner_profile'] = comment_owner[0]['profile_picture']
                result[0]['comments'] = comments

                response = Response(200, data_type='application/json', data = json.dumps(result))
            else:
                response = Response(401)
        except:
            response = Response(404)
    else:
        response = Response(401)

    return response.get_response()

