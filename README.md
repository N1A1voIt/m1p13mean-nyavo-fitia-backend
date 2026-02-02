# m1p13mean-nyavo-fitia-backend

Backend application for the M1 MEAN project. This API handles user authentication and management features using Node.js, Express, and MongoDB.

## 🚀 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v22.22.0
- **npm**: (comes with Node.js)
- **MongoDB**: Integration requires a running MongoDB instance.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs (Password hashing), CORS enabled

## ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/N1A1voIt/m1p13mean-nyavo-fitia-backend.git
    cd m1p13mean-nyavo-fitia-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    
    Update the `.env` file with your specific configuration:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=supersecretkey
    ```

## 🏃‍♂️ Running the Application

### Development Mode
To run the server with hot-reloading (using `nodemon`):
```bash
npm run dev
```

The server will start on the port defined in your `.env` file (default: 3000).

## 📂 Project Structure

The project follows a standard MVC architecture:

```
src/
├── config/         # App configuration files
├── controllers/    # API controllers (logic)
├── middlewares/    # Express middlewares (auth, validation, etc.)
├── models/         # Mongoose models (User, etc.)
├── routes/         # API routes definitions
├── utils/          # Utility functions
├── app.js          # App setup (middlewares, routes)
└── server.js       # Entry point - Server startup
```

## 🔌 API Endpoints

### Authentication
- Authentication routes are handled in `src/routes/auth.routes.js`.
- Key features include user registration and login.
