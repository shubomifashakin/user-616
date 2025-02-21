# User Management API

A simple API for user registration and retrieval using PostgreSQL database, with real-time communication capabilities through Socket.IO.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Prisma ORM
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Language**: TypeScript

## Prerequisites

- Docker

## Getting Started

1. Build the Docker image
2. Run the application using docker-compose:
   ```
   bash
   docker-compose -f express.yaml up
   ```
   **Note**: Ensure to update the express-app image in the compose file to match the name you assigned to the image you built
3. The server will be available at `http://localhost:3000`

## API Endpoints

### Create New User

This is used to create a new user in the db

**POST** `/user/new`

**Request Body**:

```
{
"first_name": string,
"last_name": "string",
"username": "string"
}
```

**Success Response**:

```
{
"message": "new user added",
"status": "success"
}
```

**Error Response** (Username exists):

```
{
"message": "username already exists",
"status": "fail",
"error_code": "DUPLICATE_ENTRY"
}
```

### Get User by Username

This is used to get a particular user from the db

**GET** `/user/:username`

**Success Response**:

```
{
"first_name": "string",
"last_name": "string",
"username": "string"
}
```

**Error Response** (User not found):

```
{
"message": "user not found",
"status": "fail",
"error_code": "NOT_FOUND"
}
```

## Real-time Features

The API includes a Socket.IO server for real-time communication between connected users. Details available in the API documentation.
