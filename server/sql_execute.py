import sqlite3

def sql_execute(sql, method):

    mydb = sqlite3.connect('insta_clone.db')

    mycursor = mydb.cursor()
    data = list()
    mycursor.execute(sql)
    if method == 'get':
        myresult = mycursor.fetchall()
        columns = [i[0] for i in mycursor.description]
        data = [dict(zip(columns,k)) for k in myresult]
        return data
    elif method == 'check':
        myresult = mycursor.fetchall()
        return myresult
    elif method == 'change':
        mydb.commit()

    return data


