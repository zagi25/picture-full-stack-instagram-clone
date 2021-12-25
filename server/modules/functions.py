import string
import random
import base64
import json
from sql_execute import sql_execute
import mysql.connector



#Creates string that is 20 characters long from random choices of uppercase letters, lowercase letters and digits
def create_token():
    N = 20
    token = ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k = N))
    return token

#Getting image type from base64 encoded string
def image_type(image):
    image1 = image.split(',')
    e = image1[0].split(';')
    e1 = e[0].split('/')
    return e1[1]

#Converting base64 encoded string to image file, saves it and returns image path 
def image_save(path, image):
    t = image_type(image)
    path_of_img = path + f'.{t}'
    image64 = image.split(',')
    img = base64.b64decode(image64[1] + '==')
    image = open(path_of_img, 'wb')
    image.write(img)
    return path_of_img

#Checking if request is sent from valid user
def is_valid(request):
    #Checking with cookies(works on local machine)
    # cookies = request.get_header('Cookie').split(';')
    # if cookies:
    #     for cookie in cookies:
    #         a = cookie.split('=')
    #         if a[0].strip() == 'token':
    #             token = a[1]
    #             sql = "SELECT CASE WHEN EXISTS ( SELECT * FROM users WHERE token='%s') THEN 'True' ELSE 'False' END" % (token)
    #             myresult = sql_execute(sql, 'check')
    #             return [myresult[0][0], token]

    # return [False,False]

    #Checking with token which is sent along side data because I couldn't figure out how to send cookies on heroku 
    #Returns result of checking('True' or 'False'), value of token and data sent
    recived_data = json.loads(request.sent_data)
    if len(recived_data) == 1:
        token = recived_data[0]['token']
        sql = f"SELECT CASE WHEN EXISTS ( SELECT * FROM users WHERE token='{token}') THEN 'True' ELSE 'False' END"
        res = sql_execute(sql, 'check')
        return [res[0][0], token]

    elif len(recived_data) == 2:
        token = recived_data[0]['token']
        data = recived_data[1]
        sql = f"SELECT CASE WHEN EXISTS ( SELECT * FROM users WHERE token='{token}') THEN 'True' ELSE 'False' END"
        res = sql_execute(sql, 'check')
        return [res[0][0], token, data]

    else:
        return False

#Checking if one user follows another
#Returns a string with follow status
def is_following(token, followed):
    user = loggedUser(token)
    follower = user['user_id']#follower is user making request
    status = str()
    if int(follower) == int(followed):
        status = 'same'
    else:
        sql1=f"SELECT status FROM follow WHERE follower={follower} AND followed={followed}"
        res_status1=sql_execute(sql1, 'get')
        sql2 = f"SELECT status FROM follow WHERE follower={followed} AND followed={follower}"
        res_status2=sql_execute(sql2, 'get')
        if res_status1 and not res_status2:
            if res_status1[0]['status'] == 'request_sent':
                status = 'request_sent'
            elif res_status1[0]['status'] == 'following':
                status = 'following'

        elif res_status1 and res_status2:
            if res_status1[0]['status'] == 'following' and res_status2[0]['status'] == 'request_sent':
                status = 'request_recivedF'
            elif res_status1[0]['status'] == 'request_sent' and res_status2[0]['status'] == 'following':
                status = 'request_sent'
            else:
                status = 'followingF'

        elif not res_status1 and res_status2:
            if res_status2[0]['status'] == 'request_sent':
                status = 'request_recived'
            elif res_status2[0]['status'] == 'following':
                status = 'follow_back'

        else:
            status = ''

    return status

def loggedUser(token):
    sql = f"SELECT * FROM users WHERE token='{token}'"
    result = sql_execute(sql, 'get')

    return result[0]
