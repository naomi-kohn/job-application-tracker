# Job Application Tracker

A full-stack web application for tracking and managing job applications throughout the recruitment process.

## Features

- Add new job applications
- View all applications in a dashboard
- Edit existing applications
- Delete applications
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

### Frontend
- HTML
- CSS
- JavaScript

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
├── main.py
├── database.py
├── db_models.py
├── models.py
├── requirements.txt
├── .gitignore
└── README.md