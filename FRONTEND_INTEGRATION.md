# Frontend Integration Task: Angular Auth with Firebase + Express

## Context
The backend is an Express.js API versioned at `/api/v1`. it uses **Firebase Admin SDK** for authentication and **MongoDB** for persistent user data and roles.

## Objective
Integrate the Angular frontend with the backend authentication system. The backend is designed for a **Hybrid Strategy**:
1.  **Direct Login**: Backend handles email/password directly.
2.  **Social Login**: Angular captures the Firebase `idToken` and sends it to the backend for verification and DB sync.

---

## 1. Setup Requirements
*   **Firebase SDK**: Initialize the standard Firebase Web SDK in Angular.
*   **Base URL**: `http://localhost:3000/api/v1`
*   **Auth Interceptor**: Implement an `HttpInterceptor` to attach the Firebase `idToken` as a **Bearer Token** in the `Authorization` header for protected routes.

---

## 2. Authentication Flows

### A. Google Login (Social Sync)
1.  Frontend uses Firebase: `signInWithPopup(auth, new GoogleAuthProvider())`.
2.  Retrieve the token: `const idToken = await user.getIdToken()`.
3.  Send to backend: `POST /auth/login` with `{ "idToken": idToken }`.
4.  **Note**: If the backend returns `404`, the user is authenticated in Firebase but doesn't exist in our MongoDB. Redirect them to a "Complete Profile" page to call `/auth/register`.

### B. Email/Password Login
Call `POST /auth/login` with:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
*The backend verifies these credentials against Firebase and returns the MongoDB profile.*

### C. Registration (User or Shop)
Call `POST /auth/register` with:
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "name": "Full Name",
  "username": "unique_username",
  "role": "shop", 
  "shopName": "My Store Name" 
}
```
*   **Roles**: Use strings `"user"` or `"shop"`. 
*   **Shop logic**: If the role is `"shop"`, the backend automatically creates a `Shop` document in MongoDB.

---

## 3. Data Schema Reference

### Roles Mapping (Backend Response)
When you receive a user object, the role will be an integer:
*   `0`: Regular User
*   `1`: Shop Owner
*   `2`: Admin

### Standard Response Shape
```json
{
  "success": true,
  "status": 200,
  "data": {
    "user": {
      "id": "mongo_id",
      "uid": "firebase_uid",
      "email": "...",
      "name": "...",
      "role": 0
    },
    "firebaseToken": "..." 
  }
}
```

---

## 4. API Testing
Complete API documentation and an interactive testing environment are available at:
`http://localhost:3000/api-docs`
