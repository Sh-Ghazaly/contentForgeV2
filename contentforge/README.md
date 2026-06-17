# ContentForge Frontend

A modern, responsive web application built with Vue 3 to manage and generate AI-driven content.

## Features

- **Intuitive Dashboard:** A central hub for managing your content lifecycle.
- **AI Content Tools:**
    - **AI Chat:** Brainstorm ideas and refine content with an AI assistant.
    - **Poster Generator:** Create visually appealing posters with AI assistance.
    - **AI Reels:** Generate scripts and creative directions for short-form video content.
- **Post Management:** Create, save, and manage drafts of your social media posts.
- **Dynamic Branding:** Configure and apply your brand voice and style across generated content.
- **Multilingual & RTL Support:** Fully localized for English and Arabic, with proper RTL layout handling.
- **Dark/Light Mode:** Seamlessly switch between themes for the best viewing experience.
- **Admin Dashboard:** Tools for administrators to manage users, monitor trends, and configure subscription plans.

## Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **I18n:** [vue-i18n](https://vue-i18n.intlify.dev/)
- **Router:** [Vue Router](https://router.vuejs.org/)
- **Notifications:** [vue-toastification](https://marcelovicentegomes.github.io/vue-toastification/)

## Getting Started

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd contentforge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Configuration

The application expects certain environment variables for features like Google Login and API endpoints. Copy `.env.example` to `.env` and fill in the required values:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Project Structure

- `src/api/`: Axios client and API service modules.
- `src/components/`: Reusable UI components (Navbar, Footer, Hero, etc.).
- `src/composables/`: Shared logic and stateful functions (theming, notifications).
- `src/locales/`: Translation files (en.json, ar.json) and i18n configuration.
- `src/stores/`: Pinia state management stores.
- `src/views/`: Main page components and routing entry points.
- `src/style.css`: Global styles and Tailwind imports.
