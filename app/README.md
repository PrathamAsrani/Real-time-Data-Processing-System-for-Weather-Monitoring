Here's the updated `README.md` file with detailed steps for running the app:

---

# Rule Engine with AST

## Overview
The project implements a **3-tier rule engine** using **Abstract Syntax Tree (AST)**, enabling users to define, manage, and validate rules against a user dataset. The solution uses **PostgreSQL** for the database, **Python** with **FastAPI** for the backend, and **ReactJS** for the frontend. It adheres to principles like **Single Responsibility** and **Open/Closed Principle** for maintainable and scalable code.

## Tech Stack
- **Database**: PostgreSQL
- **Backend**: Python (FastAPI)
- **Frontend**: ReactJS

## Running Commands
- **Backend**: `uvicorn main:app --reload`
- **Frontend**: `npm start`

## Getting Started
Follow these steps to set up and run the application:

### Prerequisites
- Ensure you have **Python**, **Node.js**, and **npm** installed on your system.

### Steps to Run the App
1. **Open two terminals**: one for the backend and one for the frontend.

### Terminal 1: Backend Setup
1. Navigate to the project directory.
2. Create a virtual environment:
   ```bash
   pip install venv
   python -m venv backend
   ```
3. Activate the virtual environment:
   - **Windows**:
     ```bash
     ./backend/Scripts/activate
     ```
   - **Mac/Linux**:
     ```bash
     source ./backend/bin/activate
     ```
4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Terminal 2: Frontend Setup
1. Create a new React application:
   ```bash
   npx create-react-app frontend
   ```
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install the necessary packages:
   ```bash
   npm install
   ```
4. Start the frontend server:
   ```bash
   npm start
   ```

## Layer 1: Database
### 1. Database Schema
Create the tables using the following SQL scripts:

```sql
create table if not exists Users(
    id serial,
    name varchar(255),
    age int,
    department varchar(255),
    income int,
    spend int,
    primary key(id)
);

create table if not exists Rules(
    id serial primary key,
    rule text
);
```

### 2. Sample Data for Users
The table `Users` contains the following data:

| id | name            | age | department | income | spend |
|----|-----------------|-----|------------|--------|-------|
| 1  | Alice Johnson   | 30  | Sales      | 60000  | 30000 |
| 2  | Bob Smith       | 25  | IT         | 75000  | 40000 |
| 3  | Charlie Brown   | 28  | Marketing  | 50000  | 25000 |
| 4  | David Wilson    | 35  | HR         | 80000  | 20000 |
| 5  | Eva Adams       | 22  | Finance    | 55000  | 15000 |
| ...| ...             | ... | ...        | ...    | ...   |

> **Note**: For the complete dataset, please refer to `Users.csv`.

### 3. Libraries Required for Database Integration
- `psycopg2`
- `dotenv`

## Layer 2: Backend
### 1. API Routes

1. **`/add-rules`**: Adds a new rule to the database.
2. **`/rules`**: Fetches all rules and returns them as a list.
3. **`/evaluate`**: Evaluates rules against user data to identify matching users based on the rule criteria.
4. **`/`**: Returns a basic greeting message, demonstrating the server is running and tracking request counts per IP.
5. **`/rules/{rule_id}`** (PATCH): Updates an existing rule in the database based on the provided rule ID and new rule text.

### 2. Required Libraries
- `FastAPI`
- `uvicorn`
- `pydantic`

## Layer 3: Frontend
The frontend is built using **ReactJS** and is structured as follows:
- **`app.js`**: Future-proofed to use routes with `BrowserRouter`, `Routes`, and `Route` from `react-router-dom`.
- **Components Directory**: Contains all the reusable components.
- **Context Directory**: Manages global members, like rules, using React Context API.
- **Styles Directory**: Stores CSS files for styling the application.

## Features
1. **Code Maintainability**:
   - Backend:
     - `db.py`: Methods related to database operations.
     - `main.py`: REST API implementation.
   - Frontend:
     - Properly organized file structure for components, contexts, and styles.
2. **Readability and Understandability**:
   - Descriptive naming conventions for files and appropriate comments for clarity.
3. **User Convenience**:
   - Error handling using `try-catch-finally` blocks for smooth user experience.
   - `validateRule()` function for input rule validation.
4. **Security**:
   - **DDoS Protection**: IP address frequency check with a threshold of 100 requests. If exceeded, the response time is delayed by 2 seconds.
   - **Data Security**: PostgreSQL internal security mechanisms are used. Optionally, the `helmet` module can be added for enhanced protection.
5. **Rule Validation**:
   - Validates attributes when adding a new rule.
   - Ensures rules are non-empty before storing them.

## Functions
1. **Add Rule**: Adds a new rule to the database.
2. **Combine Rules**: Combines two or more rules.
3. **Validate Users for Rule**: Converts rules to JSON and validates against user data.
4. **Edit Existing Rule**: Updates an existing rule in the database.
5. **Security Mechanisms**:
   - IP frequency check to control server traffic.
6. **Rule Validation**:
   - Checks attributes and ensures non-empty rules during addition.
7. **User Notifications**:
   - Uses `toaster` for message pop-ups to enhance user experience.

