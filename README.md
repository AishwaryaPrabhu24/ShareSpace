# ShareSpace – AI-Powered Institutional Resource Sharing Platform

**ShareSpace** is an AI-powered institutional resource-sharing platform designed to improve the utilization of shared resources within educational institutions. It connects resource owners with users who need institutional equipment and facilities through intelligent resource discovery, booking management, and availability tracking.

The platform provides a centralized environment for managing resources, handling booking requests, monitoring resource usage, and improving resource accessibility.

## 🚀 Live Demo

- **Frontend:** https://share-space-mu.vercel.app
- **Backend API:** https://sharespace-backend-z1yt.onrender.com
- **API Documentation:** https://sharespace-backend-z1yt.onrender.com/docs
- **GitHub Repository:** https://github.com/AishwaryaPrabhu24/ShareSpace

## 🔑 Judge Access and Login Instructions

Judges can access the deployed ShareSpace application using the live frontend link provided above.

**Admin Demo Account**

- **Login URL:** https://share-space-mu.vercel.app
- **Account Role:** Admin
- **Admin Email:** aishu@sharespace.local
- **Password:** Aishu@123

The Admin account provides access to administrative features, including user management, resource monitoring, analytics, and audit logs.

### Available User Roles

ShareSpace supports three roles:

- **Admin:** Manages users, oversees resources, monitors analytics, and accesses audit logs.
- **Owner:** Adds and manages resources, handles booking requests, and monitors resource usage.
- **Seeker:** Discovers resources, requests bookings, joins waiting lists, and submits condition reports.

### Suggested Testing Workflow

Judges can explore the following application workflow:

1. Log in to the application using the authorised demo credentials.
2. Explore the Admin dashboard and available administrative features.
3. Review resource listings and resource availability.
4. Explore the resource discovery and AI recommendation functionality.
5. Test booking requests and owner approval workflows using the appropriate user accounts.
6. Explore waiting-list management, condition reports, and incident tracking.
7. Review notifications, analytics, and audit logs.

**Note:** Some workflows require different user roles. The eligibility verification backend API is available, but its complete frontend integration is still under development.

## 🎯 Problem Statement

Educational institutions often have valuable resources such as laboratory equipment, projectors, tools, and other facilities that are not efficiently shared or utilized.

Traditional resource management methods can lead to:

- Difficulty discovering available resources.
- Inefficient booking and approval processes.
- Resource scheduling conflicts.
- Limited visibility into resource utilization.
- Lack of transparent tracking and accountability.

ShareSpace addresses these challenges through a centralized, intelligent resource-sharing platform.

## 💡 Proposed Solution

ShareSpace provides a role-based platform that enables resource owners to publish and manage resources while allowing seekers to discover, request, and use them.

An AI-based recommendation system helps users find relevant resources based on their search queries. The platform also provides booking management, waiting lists, condition reporting, incident tracking, notifications, analytics, and audit logs.

## ✨ Key Features

### 1. Role-Based Access Control

The platform supports three user roles:

- **Admin:** Manages users, oversees resources, monitors analytics, and accesses audit logs.
- **Owner:** Adds and manages resources, handles booking requests, and monitors resource usage.
- **Seeker:** Discovers resources, requests bookings, joins waiting lists, and submits condition reports.

### 2. Resource Management

- Add, edit, and manage institutional resources.
- View resource details and availability.
- Search and filter resources.
- Admin oversight of owner-submitted resources.

### 3. AI-Powered Resource Recommendations

- Uses TF-IDF vectorization to process resource descriptions and search queries.
- Applies cosine similarity to identify relevant resources.
- Combines resource name, category, description, and location for recommendation matching.
- Supports relevance-based resource discovery.

### 4. Booking Management

- Submit resource booking requests.
- Owner approval and rejection.
- Booking availability and conflict validation.
- Prevention of overlapping bookings for the same resource.

### 5. Eligibility Management

- Supports department- and training-based eligibility criteria.
- Provides eligibility requirement and qualification verification APIs.

### 6. Waiting List Management

- Join waiting lists for unavailable resources.
- Track queue positions.
- View and cancel waiting-list requests.

### 7. Condition Reporting

- Submit check-in and check-out condition reports.
- Record resource condition and remarks.
- View condition report history.

### 8. Incident Management

- Report resource-related incidents.
- Track incident status.
- Allow authorized owners and administrators to update incidents and resolution remarks.

### 9. Notifications

- Receive booking-related notifications.
- Track unread notifications.
- Mark individual or all notifications as read.

### 10. Analytics and Audit Logs

- View platform statistics.
- Monitor resource utilization and booking trends.
- Maintain activity records for accountability and transparency.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Machine Learning | Scikit-learn |
| Recommendation Techniques | TF-IDF, Cosine Similarity |
| Authentication | JWT |
| API Communication | REST APIs |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Database Hosting | Neon |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

The application follows a client-server architecture.

1. The React frontend provides the user interface for Admin, Owner, and Seeker.
2. The FastAPI backend handles authentication, business logic, and API requests.
3. PostgreSQL stores user, resource, booking, and platform activity data.
4. The recommendation module uses Scikit-learn to identify relevant resources.
5. The frontend communicates with the backend through REST APIs.

## 🤖 AI Recommendation Methodology

The recommendation system uses a content-based filtering approach.

**Processing steps:**

1. Collect resource information, including name, category, description, and location.
2. Combine relevant resource attributes into text.
3. Convert the text into numerical vectors using TF-IDF.
4. Convert the user's search query using the same vectorizer.
5. Calculate cosine similarity between the query and resource vectors.
6. Rank relevant resources based on similarity scores.

This approach helps users discover resources that match their requirements without manually browsing every listing.

## 🗄️ Database

ShareSpace uses PostgreSQL as its relational database.

The database manages information related to:

- Users and roles
- Resources and ownership
- Bookings
- Eligibility requirements and qualifications
- Waiting-list entries
- Condition reports
- Incidents
- Notifications
- Audit logs

SQLAlchemy is used for database interaction and ORM-based operations.

## 📂 Project Structure

```text
ShareSpace/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ml/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vercel.json
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python
- Node.js and npm
- PostgreSQL

### 1. Clone the Repository

```powershell
git clone https://github.com/AishwaryaPrabhu24/ShareSpace.git
cd ShareSpace
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure the backend environment variables in a `.env` file:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sharespace_db

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Create the PostgreSQL database named `sharespace_db` before starting the backend.

Run the backend:

```powershell
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
```

Create a frontend `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Run the frontend:

```powershell
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## 🔐 Security

- JWT-based authentication.
- Role-based authorization.
- Protected API endpoints.
- Environment variables for sensitive configuration.
- Backend validation of booking and resource operations.

**Important:** Never commit `.env` files, database passwords, JWT secrets, Admin passwords, or other credentials to GitHub.

## ☁️ Deployment

The application is deployed using the following services:

- **Vercel:** React frontend hosting.
- **Render:** FastAPI backend hosting.
- **Neon:** Cloud PostgreSQL database.

## 🔮 Future Enhancements

- Advanced recommendation techniques.
- Automated waiting-list promotion.
- Enhanced resource utilization forecasting.
- Real-time notifications.
- Advanced institutional usage reports.
- Integration with institutional identity systems.

## 👩‍💻 Project Repository

**ShareSpace – AI-Powered Institutional Resource Sharing Platform**

Developed as a hackathon project to encourage efficient resource utilization, improve accessibility, and simplify institutional resource management.

**GitHub:** https://github.com/AishwaryaPrabhu24/ShareSpace