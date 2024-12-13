CREATE TABLE IF NOT EXISTS credentials (
    username TEXT PRIMARY KEY NOT NULL,
    hpassword TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    task_info TEXT NOT NULL,
    task_deadline TEXT,
    task_priority TEXT NOT NULL,
    task_completed BOOLEAN NOT NULL,
    FOREIGN KEY (user_name) REFERENCES credentials(username)
);