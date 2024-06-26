# Email Client Core System

## Description

This project is a core system for an email client. It connects with user email accounts via IMAP, synchronizes email data with Elasticsearch, and provides a real-time synchronization UI using Socket.io.

## Setup

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Running the Project

1. Clone the repository:

git clone https://github.com/Michstery/emailClientCore.git
cd email-client

2. Build and start the Docker containers:

docker-compose up --build

3. Access the API
   - locally at http://localhost:3000.
   - API is also accessible through Swagger at https://emailclientcore-2.onrender.com/docs/#/

5. API Endpoints
    - /register   Users Registration
    - /emails     Get All Synced Emails
    - /users      Get All App Users
    - /user       Get A Single App User

6. SWAGGER UI was employed for UI  
   - https://emailclientcore-2.onrender.com/docs/#/

7. API Test can be done Using Postman, Swagger or any other API test tool.

