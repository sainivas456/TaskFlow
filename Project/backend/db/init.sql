
-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  task_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress INTEGER DEFAULT 0
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
  label_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  label_name VARCHAR(50) NOT NULL,
  color VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, label_name)
);

-- Task_Labels junction table
CREATE TABLE IF NOT EXISTS task_labels (
  task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
  label_id INTEGER REFERENCES labels(label_id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  entry_id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  subtask_id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default labels for new users
INSERT INTO labels (user_id, label_name, color)
SELECT u.user_id, 'Personal', '#3B82F6'
FROM users u
LEFT JOIN labels l ON u.user_id = l.user_id AND l.label_name = 'Personal'
WHERE l.label_id IS NULL;

INSERT INTO labels (user_id, label_name, color)
SELECT u.user_id, 'Work', '#10B981'
FROM users u
LEFT JOIN labels l ON u.user_id = l.user_id AND l.label_name = 'Work'
WHERE l.label_id IS NULL;

INSERT INTO labels (user_id, label_name, color)
SELECT u.user_id, 'Study', '#F59E0B'
FROM users u
LEFT JOIN labels l ON u.user_id = l.user_id AND l.label_name = 'Study'
WHERE l.label_id IS NULL;
