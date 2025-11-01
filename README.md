# Task Management API

## Project Overview
Simple Node.js & Express API to manage tasks. Supports listing tasks, getting a task by ID (with error handling), and checking API health.

## Setup Instructions
1. Clone repo: `git clone <your-repo-url>`  
2. Enter folder: `cd task-management`  
3. Run server: `npm start`  

Server runs at http://localhost:3000

## API Endpoints
| Endpoint     | Method | Description |
|-------------|--------|-------------|
| `/`         | GET    | Root route |
| `/health`   | GET    | API health & uptime |
| `/tasks`    | GET    | All tasks |
| `/tasks/:id`| GET    | Task by ID. Returns 400 if ID invalid, 404 if not found |

### Task object example:
```json
{
  "id": 2,
  "title": "Build REST API",
  "completed": false,
  "priority": "medium",
  "createdAt": "2025-10-30T12:00:00.000Z"
}
