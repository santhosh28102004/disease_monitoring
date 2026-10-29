# Health Surveillance System

A centralized web-based health surveillance platform that allows citizens to report health issues, healthcare workers to verify reports, and health officials to analyze disease trends and manage alerts.

## Features

### Citizen Module
- Register and login
- Report health issues and symptoms
- Track report status
- View disease information
- View public health alerts

### Healthcare Worker Module
- Review and verify citizen reports
- Reject reports with observations
- Monitor active cases
- Track disease trends
- Access location-based reports

### Health Official Module
- View comprehensive analytics and dashboards
- Monitor disease trends and case statistics
- Track high-risk areas
- Manage health alerts
- Access location monitoring data

### Admin Module
- User management (assign roles, activate/deactivate accounts)
- Disease management (add, edit, delete diseases)
- Location management
- System audit logs
- Alert management

## Technology Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API communication
- Bootstrap 5 for styling
- Recharts for data visualization

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing
- CORS enabled

### Database
- MongoDB (local or cloud)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud connection)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/health-surveillance
   JWT_SECRET=your_secure_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

5. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

   MongoDB Compass is a database client; the MongoDB server (`mongod`) must also be installed and running. The default backend URI is `mongodb://localhost:27017/health-surveillance`, which is the same URI to use when connecting Compass.

6. Seed the database with sample data:
   ```bash
   npm run seed
   ```

7. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with the API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

Register or log in through the app to use reports stored in MongoDB. Demo accounts are created by the backend seed command.

## Demo Credentials

After running the seed script, use these credentials to test different roles:

### Citizen
- Email: `citizen@example.com`
- Password: `citizen123`

### Healthcare Worker
- Email: `worker@example.com`
- Password: `worker123`

### Health Official
- Email: `official@example.com`
- Password: `official123`

### Admin
- Email: `admin@example.com`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Diseases
- `GET /api/diseases` - Get all diseases
- `GET /api/diseases/:id` - Get disease by ID
- `POST /api/diseases` - Create disease (Admin only)
- `PUT /api/diseases/:id` - Update disease (Admin only)
- `DELETE /api/diseases/:id` - Delete disease (Admin only)

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create location (Admin only)
- `PUT /api/locations/:id` - Update location (Admin only)
- `DELETE /api/locations/:id` - Delete location (Admin only)

### Reports
- `POST /api/reports` - Submit a health report
- `GET /api/reports` - Get all reports
- `GET /api/reports/user/my-reports` - Get user's reports
- `GET /api/reports/:id` - Get report by ID
- `PUT /api/reports/:id/verify` - Verify report (Healthcare Worker)
- `PUT /api/reports/:id/reject` - Reject report (Healthcare Worker)

### Cases
- `GET /api/cases` - Get all cases
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id/status` - Update case status
- `POST /api/cases/:id/observations` - Add observation

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `DELETE /api/alerts/:id` - Delete alert

### Dashboard
- `GET /api/dashboard/statistics` - Get dashboard statistics
- `GET /api/dashboard/disease-trends` - Get disease trends
- `GET /api/dashboard/location-statistics` - Get location statistics
- `GET /api/dashboard/severity-statistics` - Get severity statistics
- `GET /api/dashboard/case-status` - Get case status
- `GET /api/dashboard/high-risk-areas` - Get high-risk areas
- `GET /api/dashboard/audit-logs` - Get audit logs

## Important Notes

- This platform is for **disease surveillance and monitoring only**
- It does **NOT diagnose diseases** or replace professional medical advice
- All reports are marked as "verified for surveillance purposes" - this does not mean medical diagnosis
- Citizens should seek professional medical help for actual diagnosis and treatment
- The system maintains audit logs of all important actions
- User data is protected with bcrypt password hashing and JWT authentication

## Security Features

- JWT-based authentication
- Role-based access control
- bcrypt password hashing
- CORS configuration
- Input validation on frontend and backend
- Secure error handling
- Audit logging for critical operations
- Protected API routes

## Running the Application

1. Start MongoDB (if local):
   ```bash
   mongod
   ```

2. In one terminal, start the backend:
   ```bash
   cd backend
   npm run dev
   ```

3. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

5. Login using one of the demo credentials above

## Database Models

### User
- fullName, email, phone, password, role, location, isActive

### Disease
- diseaseName, description, category, symptoms, prevention, severityLevel, status

### Location
- area, city, district, state, status

### Report
- reporter, disease, symptoms, affectedPeople, location, dateObserved, severity, description, status

### Case
- report, disease, location, status, observations, followUpDate

### Alert
- disease, location, riskLevel, caseCount, message, status, createdBy

### AuditLog
- user, action, entity, entityId, timestamp

## License

MIT

## Support

For issues or questions, please create an issue in the project repository.
