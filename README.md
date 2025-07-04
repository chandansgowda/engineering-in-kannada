# Engineering in Kannada

[![Netlify Status](https://api.netlify.com/api/v1/badges/319b429d-ad40-467a-9d30-8c1d4cb3f75a/deploy-status)](https://app.netlify.com/projects/engineeringinkannada/deploys)

A platform for learning engineering concepts in Kannada through YouTube playlists from Engineering in Kannada.

## Table of Contents

- [Adding a New Course](#adding-a-new-course)
- [Adding a Blog Post](#adding-a-blog-post)
- [Updating Existing Content](#updating-existing-content)
- [Contribution Guidelines](#contribution-guidelines)
- [Internationalization (i18n)](#internationalization-i18n)
- [Local Development](#local-development)
- [Notes for Contributors](#notes-for-contributors)
- [Features](#features)
- [Technologies Used](#technologies-used)

## Adding a New Course

1. Add course details to `src/data/courses.json` (this will serve as the default/English version):

```json
{
  "id": "course-id",
  "title": "Course Title",
  "description": "Course description",
  "thumbnail": "YouTube thumbnail URL",
  "difficulty": "Beginner" | "Intermediate" | "Advanced"
}
```

2. Create a new video file at `src/data/videos/course-id.json`:

```json
{
  "courseId": "course-id",
  "videos": [
    {
      "id": "course-id-1",
      "title": "Video Title",
      "type": "Theory" | "Practice" | "Project",
      "youtubeUrl": "YouTube video URL",
      "notesUrl": "Optional notes URL",
      "codingQuestionUrl": "Optional practice URL"
    }
  ]
}
```

3. **(Optional) Add translations for the course:**
   - Create `src/data/courses.kn.json` (for Kannada) or `src/data/courses.<lang-code>.json` for other languages. Copy the structure from `courses.json` and translate the `title`, `description`, and `difficulty` fields for the new course.
   - Create `src/data/videos/course-id.kn.json` (for Kannada) or `src/data/videos/course-id.<lang-code>.json`. Copy the structure from `src/data/videos/course-id.json` and translate video `title` fields.

## Adding a Blog Post

1. Create a new directory in `src/blogs/your-blog-slug/` with:

```
- content.md    # Your blog post content in markdown
- metadata.json # Blog post metadata
```

2. Add metadata in `metadata.json`:

```json
{
  "title": "Your Blog Title",
  "date": "YYYY-MM-DD",
  "author": "Your Name",
  "authorUrl": "Your professional profile URL (e.g., LinkedIn, GitHub, Twitter)",
  "description": "A brief description of your blog post that will be shown in the blog cards.",
  "tags": ["tag1", "tag2"]
}
```

3. Write your blog content in `content.md` (this will be the default/English version) using markdown format.

4. **(Optional) Add translations for the blog post:**
   - Create `src/blogs/your-blog-slug/metadata.kn.json` (for Kannada) or `metadata.<lang-code>.json`. Translate the relevant fields (`title`, `description`, `tags`).
   - Create `src/blogs/your-blog-slug/content.kn.md` (for Kannada) or `content.<lang-code>.md`. Translate the markdown content.


## Updating Existing Content

1. To update course details:

   - Edit `src/data/courses.json`
   - Update the relevant course object

2. To update videos:
   - Edit the corresponding `src/data/videos/course-id.json` file
   - Maintain the same structure and IDs for existing videos
   - Add new videos at the end of the array

## Contribution Guidelines

1. **Course Structure**:

   - Keep course IDs lowercase with hyphens (e.g., `python-basics`)
   - Use descriptive titles in both English and Kannada
   - Provide clear difficulty levels

2. **Video Organization**:

   - Number videos sequentially (1, 2, 3...)
   - Include all available resources (notes, practice questions)
   - Use consistent video types (Theory/Practice/Project)

3. **Quality Checks**:

   - Verify all YouTube URLs are working
   - Ensure thumbnails are high quality
   - Check for proper translations in titles/descriptions

4. **Pull Request Process**:
   - Create a new branch for your changes
   - Update both course and video files
   - Test locally before submitting
   - Provide clear description of changes

## Internationalization (i18n)

This project uses `i18next` for internationalization.
- **Supported Languages**:
  - English (`en`)
  - Kannada (`kn`)
- **UI Strings**: Stored in `public/locales/<lang-code>/translation.json`.
- **Content (Courses, Links, Announcements)**: Translated versions of JSON files are stored with a language code suffix, e.g., `courses.kn.json`, `links.kn.json`, or use translation keys within the main JSON file (e.g. `announcements.json` uses keys that are then looked up in the `translation.json` files). The application attempts to load the current language's file or strings and falls back to the default English version if not found.
- **Content (Blogs)**:
    - Metadata: `metadata.<lang-code>.json` (e.g., `metadata.kn.json`).
    - Content: `content.<lang-code>.md` (e.g., `content.kn.md`).
    - The system will automatically try to load `metadata.<lang>.json` and `content.<lang>.md` based on the selected language, falling back to default `metadata.json` and `content.md` if translations are not present.
- **Language Switching**: Users can switch languages using the language switcher component in the header. Blog pages now dynamically update to reflect language changes immediately without requiring a page reload.

### Adding a New Language for UI Strings

1.  **Add language code to `i18n.ts`**: In the `supportedLngs` array.
2.  **Create new locale file**: Copy `public/locales/en/translation.json` to `public/locales/<new-lang-code>/translation.json`.
3.  **Translate strings**: Update the values in the new `translation.json` file.
4.  **Test**: Switch to the new language using the language switcher in the header and verify UI text.

### Adding Translations for Content

- **Courses & Videos**: Create `courses.<new-lang-code>.json` and `videos/<course-id>.<new-lang-code>.json` files.
- **Links**: Create `links.<new-lang-code>.json`.
- **Blogs**: Create `metadata.<new-lang-code>.json` and `content.<new-lang-code>.md` for each blog post.

## Local Development

### Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. Git
4. GitHub Personal Access Token (for contributor leaderboard)

### Setting up GitHub Token

1. Create a GitHub Personal Access Token:

   - Go to GitHub Settings > Developer settings > [Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Engineering in Kannada Local Dev")
   - Select the following scopes:
     - `repo:status`
     - `public_repo`
   - Click "Generate token"
   - **Copy the token immediately** (you won't be able to see it again)

2. Create Environment Variables:
   - Create a `.env` file in the project root
   - Add your GitHub token:
     ```env
     VITE_GITHUB_TOKEN=your_github_token_here
     ```
   - Replace `your_github_token_here` with the token you copied.
   - **Important for Deployment:** This token is crucial for the Contributor Leaderboard to function correctly on a deployed site (e.g., Netlify). Ensure `VITE_GITHUB_TOKEN` is also set as an environment variable in your hosting provider's settings. Without it, GitHub API requests will be unauthenticated and likely fail due to rate limiting, preventing the leaderboard from loading.

### Installation

```bash
# Clone the repository
git clone https://github.com/chandansgowda/engineering-in-kannada.git

# Navigate to project directory
cd engineering-in-kannada

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GitHub token

# Start development server
npm run dev

# Build for production
npm run build
```

## Notes for Contributors

- All content should be in both English and Kannada where possible. See the [Internationalization (i18n)](#internationalization-i18n) section for details on how to structure translated content.
- For UI text, ensure corresponding keys are added to all language files in `public/locales/`.
- Maintain consistent formatting across all JSON files.
- Keep video descriptions concise and informative.
- Update the README if you add new features or change the structure.

## Features

- Browse available courses
- Track video progress
- Bookmark favorite videos
- View course materials and coding exercises
- Read technical blogs and articles
- Responsive design for all devices
- Contributor leaderboard

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (State Management)
