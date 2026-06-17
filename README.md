# ContentForge ITI

ContentForge is an AI-powered content creation and management platform designed to help users generate, manage, and schedule social media posts, reels, and posters using advanced AI models like Google Gemini.

## Project Structure

This repository is divided into two main parts:

- `contentforge/`: The frontend application built with Vue 3, Vite, and Tailwind CSS.
- `contentforge-backend/`: The backend API built with Node.js, Express, and MongoDB.

## Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Pinia
- **Internationalization:** vue-i18n (Support for Arabic and English)
- **Routing:** Vue Router
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google Gemini (Generative AI & Embeddings)
- **Authentication:** JWT, Passport (Google & Facebook OAuth)
- **File Storage:** Cloudinary & Multer
- **Scheduled Tasks:** node-cron
- **Payments:** Stripe

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas account
- Google Gemini API Key
- Cloudinary account (for image uploads)
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd contentforge-ITI
   ```

2. Setup the backend:
   ```bash
   cd contentforge-backend
   npm install
   cp .env.example .env
   # Update .env with your credentials
   npm run dev
   ```

3. Setup the frontend:
   ```bash
   cd ../contentforge
   npm install
   cp .env.example .env
   # Update .env with your backend API URL if necessary
   npm run dev
   ```

## Documentation

- [Backend Documentation](./contentforge-backend/README.md)
- [Frontend Documentation](./contentforge/README.md)

## License
This project is licensed under the MIT License.
