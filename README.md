# Jan-Mat - The People's Voice

Jan-Mat is a citizen-powered legislative platform that enables everyday citizens to propose, debate, and advance laws within the framework of the Indian Constitution. The platform uses AI to check proposals against the Basic Structure Doctrine and surfaces the most viable, popular proposals for Parliamentary consideration.

## 🔗 Live
- Frontend: [https://jan-mat-delta.vercel.app](https://jan-mat-delta.vercel.app)
- Backend API: [https://jan-mat-delta.vercel.app](https://jan-mat-delta.vercel.app)

## Features

- **Citizen Proposals**: Any verified citizen can submit a detailed proposal for a new law or policy change.
- **Community Voting**: The community can upvote, downvote, and engage in constructive debate on proposals.
- **AI Constitutional Check**: An integrated AI engine (powered by Gemini) reviews high-traction proposals against the Indian Constitution, scoring them for constitutional viability and social impact.
- **People's Choice (Top 5)**: The best, constitutionally-sound proposals are dynamically ranked and presented to policymakers and Parliamentary observers.
- **Secure Verification**: Integration paths for Aadhaar/DigiLocker verification to ensure authentic, verified participation.
- **Real-Time Notifications**: SMS and Email acknowledgement services for newly submitted proposals.

---

## Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- UI Design: Custom glassmorphism, responsive data-heavy design, and intuitive user flows.

### Backend
- **Node.js** & **Express**
- **MongoDB** (Mongoose ORM)
- **JWT** for Authentication
- **Bcrypt** for secure password hashing

### Third-Party Services
- **Google Generative AI (Gemini 2.5 Flash)**: For constitutional analysis and proposal sentiment summarization.
- **Nodemailer**: Email OTP delivery for secure user registration.
- **Twilio**: SMS acknowledgement for successful proposal submissions.

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB account (or local MongoDB server)
- API Keys for Google Gemini, Twilio, and an SMTP Email provider (e.g., Gmail Passwords).

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` directory with the following configuration:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
DEMO_MODE=false # Set to true to bypass AI and use mock data

# Email (Nodemailer SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Jan-Mat <your_email@gmail.com>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client` directory (if required for custom API URLs):

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run the Application

Start the backend and frontend simultaneously:

```bash
# Terminal 1 - Start the Backend Server
cd server
npm run dev

# Terminal 2 - Start the Frontend Client
cd client
npm run dev
```

Visit `http://localhost:5173` to view the application in your browser.

---

## Usage Guide

1. **Register**: Sign up as a new user. You will receive an OTP via email to verify your account.
2. **Post a Proposal**: Navigate to the "Submit Proposal" page, enter a detailed description of your law or policy, and select the relevant category.
3. **Voting & Debating**: Browse proposals, read the arguments, upvote or downvote, and add your comments.
4. **AI Analysis Cycle**: In production, the admin can trigger the AI Analysis (via the Admin Dashboard) to review all top-voted proposals. The AI provides a "Constitutional Score" and an "Impact Score," filtering out unconstitutional ideas into a "Needs Revision" queue.
5. **Admin Dashboard**: Users with the `admin` role can govern the platform, trigger AI cycles, and mark proposals as "Passed" or "Sent to Parliament."

---

## Understanding The AI Integration

The `server/src/services/openai.js` file handles the AI analysis. It uses Google's `gemini-2.5-flash` model.

**Important Note on AI Bypass (`DEMO_MODE`)**: 
If you simply want to test the UI without calling the Gemini API, you can set `DEMO_MODE=true` in `server/.env`. This will bypass the API request and use mock data for the Constitutional analysis. To use real AI analysis, ensure `DEMO_MODE=false` and that a valid `GEMINI_API_KEY` is provided.

---

## Understanding The SMS Integration

The `server/src/services/sms.js` file handles sending an acknowledgement SMS via Twilio when a user submits a proposal.

**Important Twilio Note**: If you are using a **Twilio Trial Account**, Twilio strictly prevents you from sending SMS to any phone numbers that have not been explicitly verified in your Twilio Console (under Phone Numbers -> Manage -> Verified Caller IDs). Ensure the recipient number is verified, or upgrade to a paid Twilio account for production use.
