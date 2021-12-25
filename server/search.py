import json
from modules.response import Response
from modules.sql_execute import sql_execute
from modules import functions

def get_result(request):
    is_valid, token, data = functions.is_valid(request)
    if is_valid == 'True':
        if data:
            sql = f"SELECT username, profile_picture FROM users WHERE username LIKE '{data}%'"
            result = sql_execute(sql, 'get')
            response = Response(200, data_type='application/json', data = json.dumps(result))
        else:
            response = Response(400)

    else:
        response = Response(401)

    return response.get_response()
