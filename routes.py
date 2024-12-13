from flask import Flask, request, render_template, redirect, url_for, flash, session, g, jsonify
import json
import os
import bcrypt
import sqlite3
app = Flask(__name__)

# defines db location to login.db
db_location = 'var/login.db'

# A Secret key is added to the session
app.secret_key = os.urandom(24)

# Method to get database
def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = sqlite3.connect(db_location)
        g.db = db
    return db

@app.teardown_appcontext

# closes database
def close_db_connection(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

# Initialises database
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('var/schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
            db.commit()

# route to load tasks for a logged-in user
@app.route('/load_tasks', methods=['GET'])
def load_tasks():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 403

    username = session['username']
    try:
        db = get_db()
        cursor = db.cursor()

        # Query to get all current tasks (active) from database table 'tasks' based on username
        cursor.execute("SELECT task_info, task_deadline, task_priority, task_completed FROM tasks WHERE user_name = ? AND task_completed == FALSE ", (username,))
        active_list = cursor.fetchall()

        # Same query for all completed tasks based on user.
        cursor.execute("SELECT task_info, task_deadline, task_priority, task_completed FROM tasks WHERE user_name = ? AND task_completed == TRUE", (username,))
        complete_list = cursor.fetchall()

        # Format the tasks into a list of dictionaries
        active_list = [{"info": task[0], "deadline": task[1], "priority": task[2], "completed": task[3]} for task in active_list]
        complete_list = [{"info": task[0], "deadline": task[1], "priority": task[2], "completed": task[3]} for task in complete_list]


        return jsonify({
            "activeList": active_list,
            "completeList": complete_list
        }), 200
    # Exception thrown in case of failure
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Save list to database table functionality
@app.route('/save_lists', methods=['POST'])
def save_todos():
    # checks if current user is on session's username
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 403


    data = request.get_json()
    username = session['username']
    todos = data.get('todoList', [])
    completed_todos = data.get('comTodoList', [])

    try:
        db = get_db()
        cursor = db.cursor()


        cursor.execute( "DELETE FROM tasks WHERE user_name = ? AND task_completed == TRUE", (username,))
        cursor.execute (" DELETE FROM tasks WHERE user_name = ? AND task_completed == FALSE", (username,))
        # Insert active todos into tasks table
        for todo in todos:
            cursor.execute("INSERT INTO tasks (user_name, task_info, task_deadline, task_priority, task_completed) VALUES (?, ?, ?, ?, ?)",
                           (username, todo['info'], todo['deadline'], todo['priority'], False))

        # Insert completed todos into completeTasks table
        for completed_todo in completed_todos:
            cursor.execute("INSERT INTO completeTasks (user_name, task_info, task_deadline, task_priority, task_completed) VALUES (?, ?, ?, ?, ?)",
                           (username, completed_todo['info'], completed_todo['deadline'], completed_todo['priority'], True))

        db.commit()
        return jsonify({"message": "Todos saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
        return render_template('index.html')
@app.route ('/login', methods=['POST', 'GET'])
def login():
    db = get_db()
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor = db.cursor().execute('SELECT * FROM credentials WHERE username = ?', (username,))
        user = cursor.fetchone()

        if user:
            # User found, validate the password
            stored_password = user[1]
            if bcrypt.checkpw(password.encode('utf-8'), stored_password):
                session['username'] = username

                return redirect('/mainpage/' + username)
            else:
                flash('Invalid password. Please try again.')
                return render_template('login.html')
        else:
            flash('Invalid username. Please try again.')
            return render_template('login.html')

    else:

        return render_template('login.html')

@app.route ('/signup/', methods=['POST', 'GET'])
def signup():
    db = get_db()
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor = db.cursor()
        cursor.execute('SELECT * FROM credentials WHERE username = ?', (username,))
        user = cursor.fetchone()

        if user:
            flash('Username already taken.')
            return redirect('/signup/')
        else:
            flash('Account created.')
            password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute('INSERT INTO credentials (username, hpassword) VALUES (?, ?)', (username, password))
            db.commit()
        return redirect ('/mainpage/' + username)
    else:

        return render_template('signup.html')
@app.route ( '/mainpage/<username>', methods=['POST', 'GET'])
def mainpage(username = None):
    db = get_db()
    if 'username' in session:
        username = session['username']
    else:
        redirect ('/login')

    return render_template('mainpage.html', username=username)

@app.route ('/logout')
def logout():
    session.pop('username', None)
    flash('Logged out successfully.')
    return redirect ('/login')


@app.errorhandler(404)
def page_not_found(error):
    return "Error: page not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

