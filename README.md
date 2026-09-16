# Job Application Tracker

A full-stack web application for tracking and managing job applications throughout the recruitment process.

The application allows users to create personal accounts, securely log in, and manage their own job applications through an interactive dashboard.

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing
- User-specific application data
- Add new job applications
- View all applications in a dashboard
- Edit and delete applications
- Update application status
- Search by company or position
- Filter applications by status
- Track application statistics
- Store job posting links, locations, and notes
- Persistent data storage with PostgreSQL

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- REST API
- JWT Authentication
- pwdlib password hashing

### Frontend

- HTML
- CSS
- JavaScript

## Authentication

Users can register and log in to the application.

Passwords are securely hashed before being stored in the database. After a successful login, the backend generates a JSON Web Token (JWT), which is used to authenticate protected API requests.

Each job application is associated with its owner, ensuring that users can only access and manage their own applications.

## Application Statuses

Applications can be tracked through:

- Applied
- Interview
- Offer
- Rejected

## Project Structure

```text
job-application-tracker/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── auth.py
├── main.py
├── database.py
├── db_models.py
├── models.py
├── requirements.txt
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication

- `POST /register` — create a user account
- `POST /login` — authenticate a user and receive an access token

### Applications

- `POST /applications` — create an application
- `GET /applications` — retrieve the authenticated user's applications
- `GET /applications/{id}` — retrieve a specific application
- `PUT /applications/{id}` — edit an application
- `PATCH /applications/{id}/status` — update application status
- `DELETE /applications/{id}` — delete an application

Application endpoints are protected using JWT authentication.

## Running the Project

### 1. Install dependencies

```bash
py -m pip install -r requirements.txt
```

### 2. Configure PostgreSQL

Create a PostgreSQL database named:

```text
job_tracker
```

Create a `.env` file in the project root:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/job_tracker
SECRET_KEY=YOUR_SECRET_KEY
```

The `.env` file is excluded from version control.

### 3. Start the backend

```bash
py -m uvicorn main:app --reload
```

The API runs locally on port `8000`.

Interactive FastAPI documentation is available at `/docs`.

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
py -m http.server 5500
```

The frontend runs locally on port `5500`.

## Security

- Passwords are stored as secure hashes rather than plaintext.
- Protected API routes require JWT authentication.
- Applications are associated with individual user accounts.
- Database credentials and the JWT secret key are stored using environment variables and excluded from Git.

## Author

**Naomi Kohn**  
Computer Science Student  
The Hebrew University of Jerusalem