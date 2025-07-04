# Project Overview: Engineering in Kannada

## 1. Purpose

The "Engineering in Kannada" platform aims to provide accessible engineering education and technical content primarily in the Kannada language. It aggregates YouTube playlists, blog articles, and other learning resources to support students and professionals in Karnataka and Kannada-speaking regions. The platform emphasizes breaking down language barriers in technical education.

## 2. Key Features

*   **Course Aggregation:** Curated lists of engineering courses, primarily from the "Engineering in Kannada" YouTube channel, organized by topics.
*   **Video Player Integration:** Embedded YouTube player for watching course videos directly on the platform.
*   **Progress Tracking:** Users can mark videos as watched to keep track of their learning progress (leveraging browser local storage).
*   **Technical Blog:** A collection of articles on various engineering and technology topics, supporting markdown for content.
*   **Multilingual Support (i18n):**
    *   UI text translated into English and Kannada.
    *   Content (course details, video titles, blog posts) can also be provided in both languages.
    *   The system is designed to fall back to English if Kannada translations are unavailable.
*   **Resource Links:** A curated list of useful external links and resources.
*   **Contributor Leaderboard:** Shows top contributors to the project's GitHub repository.
*   **Responsive Design:** Aims to be usable across various devices (desktops, tablets, mobiles).

## 3. Technology Stack

*   **Frontend Framework:** React with Vite for fast development and optimized builds.
*   **Language:** TypeScript for type safety and improved developer experience.
*   **Styling:** Tailwind CSS for utility-first CSS styling.
*   **Routing:** React Router for client-side navigation.
*   **State Management:** Zustand for lightweight global state management (e.g., for search queries, progress).
*   **Internationalization:** `i18next` and `react-i18next` for managing translations.
*   **Content Format:**
    *   Course and video metadata: JSON files.
    *   Blog content: Markdown files (`.md`) with JSON for metadata.

## 4. Project Structure Highlights

*   `public/`: Static assets, including locale files for i18n (`public/locales/`).
*   `src/`: Main application source code.
    *   `components/`: Reusable React components (Header, Footer, Cards, etc.).
    *   `pages/`: Top-level page components (HomePage, Blogs, CoursePage, etc.).
    *   `data/`: JSON files for courses, videos, and links.
    *   `blogs/`: Contains subdirectories for each blog post, with markdown content and JSON metadata.
    *   `utils/`: Utility functions (e.g., `blogUtils.ts`, `courseUtils.ts`).
    *   `services/`: Services for interacting with external APIs (e.g., `github.ts`).
    *   `store/`: Zustand store definitions.
    *   `types/`: TypeScript type definitions.
    *   `i18n.ts`: Configuration for internationalization.
    *   `main.tsx`: Main entry point of the React application.
*   `README.md`: Detailed information about setup, contribution, and project structure.
*   `docs/`: Additional project documentation (like this overview).

This overview provides a snapshot of the project. For more detailed information on specific aspects like contributing, local setup, or adding content, please refer to the main `README.md` file.
