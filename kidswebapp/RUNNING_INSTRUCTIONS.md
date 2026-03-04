# How to Run the Kids Audio App

## Option 1: Using the Batch Files (Recommended)

Simply double-click on `START_APP.bat` in the project root folder. This will:
1. Open a new terminal for the Backend (port 5000)
2. Open a new terminal for the Frontend (port 3000)
3. Automatically open your browser to http://localhost:3000

## Option 2: Manual Setup

### Step 1: Start the Backend

Open a terminal/command prompt and run:

```
bash
cd "Kids Web  App/backend"
python app.py
```

The backend will start on http://localhost:5000

### Step 2: Start the Frontend

Open a **new** terminal/command prompt and run:

```
bash
cd "Kids Web  App/frontend"
npm run dev
```

The frontend will start on http://localhost:3000

### Step 3: Open Your Browser

Navigate to http://localhost:3000 to view the app.

## Demo Login Credentials

Use any of these accounts to log in:

| Role   | Username    | Password   |
|--------|-------------|------------|
| Parent | demo_parent | parent123  |
| Kid    | demo_kid    | kid123     |
| Admin  | demo_admin  | admin123   |

## Troubleshooting

- **If login fails**: Make sure BOTH backend and frontend are running
- **Port already in use**: Close other applications using ports 3000 or 5000
- **Dependencies missing**: Run `npm install` in the frontend folder first

## What Each Server Does

- **Backend (Flask)**: Handles authentication, database, API endpoints
- **Frontend (Vite/React)**: The web interface users see in their browser
