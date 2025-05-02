
# TaskFlow API Server

This is the backend API server for TaskFlow, a task management application.

## Setup

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file by copying `.env.example` and filling in your PostgreSQL credentials
   ```
   cp .env.example .env
   ```
4. Customize the environment variables in the `.env` file with your database connection details
5. Start the development server
   ```
   npm run dev
   ```

## Database Schema

The application relies on the following PostgreSQL tables:

- `Users`: User accounts
- `Tasks`: User tasks
- `Labels`: Task categorization labels
- `Time_Entries`: Time tracking for tasks
- `Shared_Tasks`: Task collaboration data

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get a token
- `GET /api/auth/me`: Get current user info

### Tasks
- `GET /api/tasks`: Get all user tasks
- `GET /api/tasks/:id`: Get a specific task
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task
- `PUT /api/tasks/:id/complete`: Mark a task as completed

### Labels
- `GET /api/labels`: Get all user labels
- `POST /api/labels`: Create a new label
- `PUT /api/labels/:id`: Update a label
- `DELETE /api/labels/:id`: Delete a label

### Time Tracking
- `GET /api/time-tracking`: Get all time entries
- `GET /api/time-tracking/task/:taskId`: Get time entries for specific task
- `POST /api/time-tracking`: Create a time entry
- `PUT /api/time-tracking/:id`: Update a time entry
- `DELETE /api/time-tracking/:id`: Delete a time entry

### Export
- `GET /api/export/tasks`: Export all tasks
- `GET /api/export/time-entries`: Export all time entries
- `GET /api/export/all`: Export all user data

### Import
- `POST /api/import/tasks`: Import tasks
- `POST /api/import/labels`: Import labels

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header like this:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Error Handling

API endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 404: Resource not found
- 500: Server error

All error responses include a JSON object with an error message.
