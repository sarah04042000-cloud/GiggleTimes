# Troubleshooting Guide

## Issue 1: "cd backend" Cannot find path

The folder name has spaces, so you need to use quotes:

### Wrong ❌
```
bash
cd backend
```

### Correct ✅
```
bash
cd "Kids Web  App/backend"
```

Or use the batch files:
- Double-click `START_APP.bat` to run both frontend and backend
- Or double-click `start_backend.bat` and `start_frontend.bat` separately

---

## Issue 2: Login Not Working

### Step 1: Make sure MongoDB is running
- If using MongoDB Atlas, check your internet connection
- If using local MongoDB, make sure it's installed and running

### Step 2: Seed the demo users
The demo users (demo_parent, demo_kid, demo_admin) must be added to the database.

Run this command from the backend folder:

```
bash
cd "Kids Web  App/backend"
python seed.py
```

### Step 3: Start both servers
Open TWO separate terminals:

**Terminal 1 - Backend:**
```
bash
cd "Kids Web  App/backend"
python app.py
```

**Terminal 2 - Frontend:**
```
bash
cd "Kids Web  App/frontend"
npm run dev
```

### Step 4: Test the login
1. Open http://localhost:3000 in your browser
2. Click on "parent", "kid", or "admin" buttons to fill in demo credentials
3. Click "Sign In"

---

## Demo Credentials

| Role   | Username    | Password   |
|--------|-------------|------------|
| Parent | demo_parent | parent123  |
| Kid    | demo_kid    | kid123     |
| Admin  | demo_admin  | admin123   |

---

## Common Errors and Solutions

### "MongoClient' object has no attribute 'admin'"
This usually means MongoDB isn't running or the connection string is wrong. Check your .env file or MONGO_URI.

### "Token is missing" after login
This could indicate the JWT_SECRET isn't configured. The app uses a default secret, so this shouldn't happen.

### Frontend shows "Network Error"
Make sure both servers are running:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000
