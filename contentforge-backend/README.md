# ContentForge Backend

The backend of ContentForge is a robust API built with Node.js and Express, integrating advanced AI capabilities and various third-party services.

## Features

- **AI Content Generation:** Uses Google Gemini (2.5 Flash) for generating posts, reels, and posters.
- **RAG Pipeline:** Implements Retrieval-Augmented Generation for specialized content knowledge.
- **Authentication:** Secure user authentication using JWT and OAuth (Google/Facebook).
- **Subscription Management:** Tiered subscription system with Stripe integration.
- **Trend Scraping:** Automatic trend discovery using `google-trends-api` and `node-cron`.
- **Media Management:** Handles file uploads (PDFs for knowledge base, images for posters) via Multer and Cloudinary.
- **Email Services:** Sends notifications and OTPs using Nodemailer.
- **Admin Dashboard API:** Specialized routes for managing users, plans, and system-wide trends.

## Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **AI:** Google Generative AI (Gemini), Hugging Face Transformers
- **Auth:** Passport.js, JWT, bcryptjs
- **Storage:** Cloudinary
- **Payments:** Stripe
- **Validation:** express-validator

## Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas Cluster
- Google Gemini API Key
- Cloudinary Credentials
- Stripe API Keys

### Installation

1. Navigate to the backend directory:
   ```bash
   cd contentforge-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GEMINI_API_KEY=your_key
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   STRIPE_SECRET_KEY=your_key
   ```

4. Run the server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

- `config/`: Database and passport configurations.
- `controllers/`: Logic for handling API requests.
- `middleware/`: Auth, subscription, and file upload middlewares.
- `models/`: Mongoose schemas.
- `routes/`: API route definitions.
- `services/`: Business logic and external service integrations (Gemini, Email, etc.).
- `utils/`: Helper functions.

## Detailed Guide
For a more comprehensive step-by-step setup, refer to [BACKEND_GUIDE.md](./BACKEND_GUIDE.md).
