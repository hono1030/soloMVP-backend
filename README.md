# Backend Server for Discover Japan

This is the backend repository for Discover Japan. It handles server-side, database interactions, and API endpoints for the frontend application.
https://solomvp-discoverjp-backend-c3bd8220ad7a.herokuapp.com/

---

## Technology

- **Express.js**: Framework for server and middleware.
- **Knex.js**: SQL query builder.
- **bcrypt**: Library for securely hashing and salting passwords to protect user credentials.
- **express-session**: Middleware for managing user sessions with cookies, storing data on the server for persistent login states.
- **crypto**: Module for cryptographic operations like generating secure keys for session management and data encryption.
- **Amazon S3**

---

## Installation

This backend server is built with Express, Knex.js, and various other libraries to handle user authentication, session management, and interactions with the frontend. Follow the steps below to install and configure the server.

### Prerequisites

Ensure that you have the following installed:

- Node.js
- npm
- Database (PostgreSQL)

### Setup

Follow these steps to set up and run backend server:

### Clone the Repository

Clone this repository in your local machine:

### Install Dependencies

Install the required dependencies.

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project directory and add the following variables.

```env
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost/solomvp_db
FRONTEND_URL=[http://localhost:5173](http://localhost:5174)
OPENAI_API_KEY=<openai key>
AWS_ACCESS_KEY_ID=<aws access key>
AWS_SECRET_ACCESS_KEY=<aws secret key>
AWS_DEFAULT_REGION=<aws default region>

```

### Configure Knex.js

The backend uses Knex.js to interact with the database. Make sure knex.file is set up correctly.

### Set Up the Database

- Run Migrations
- Run Seeds
- Start the Server

---

## Endpoints

- POST /login : Authenticates user and starts session.
- POST /signup : Registers a new user with password.
- POST /logout : Ends the current user session.
- GET /sessions : Returns username and userid if the session exists.
- POST /apiChat : Send user's prefrence to chatGPT and returns the response from it.
- POST /upload/:userId/:prefectureCode : Upload a picture to S3.
- GET /images/:prefectureCode : Retrieve pictures from S3.

---
