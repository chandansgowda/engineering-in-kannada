# Engineering in Kannada

[![Netlify Status](https://api.netlify.com/api/v1/badges/319b429d-ad40-467a-9d30-8c1d4cb3f75a/deploy-status)](https://app.netlify.com/projects/engineeringinkannada/deploys)

A platform for learning engineering concepts in Kannada through YouTube playlists from Engineering in Kannada.

## Table of Contents

- [Adding a New Course](#adding-a-new-course)
- [Adding a Blog Post](#adding-a-blog-post)
- [Updating Existing Content](#updating-existing-content)
- [Contribution Guidelines](#contribution-guidelines)
- [Local Development](#local-development)
- [Notes for Contributors](#notes-for-contributors)
- [Features](#features)
- [Technologies Used](#technologies-used)

## Adding a New Course

1. Add course details to `src/data/courses.json`:

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

3. Write your blog content in `content.md` using markdown format.

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
   - Replace `your_github_token_here` with the token you copied

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

- All content should be in both English and Kannada where possible
- Maintain consistent formatting across all JSON files
- Keep video descriptions concise and informative
- Update the README if you add new features or change the structure

## Features

- Browse courses with search (by title or topic) and filters — difficulty, in progress, starred
- Track lesson progress, with confetti 🎉 and a course-complete celebration
- Resume where you left off ("Continue learning" on the home page and course pages)
- **My Learning** dashboard: in-progress courses, saved lessons, starred courses
- Export / import progress to move between devices (progress is stored in the browser)
- Read lesson notes in-app (GitHub markdown) and open practice questions
- Site-wide search for courses, lessons, blogs and links — press `Ctrl/⌘ + K` or `/`
- Technical blogs with tag filters, reading time and reading progress
- Contributor leaderboard (cached, rate-limit friendly)
- One-click Kannada translation of the whole site (Google Translate, loaded on demand)
- Announcement bar (edit `src/data/announcements.json`), Terms & Conditions and Privacy Policy pages
- Responsive, accessible (keyboard navigation, focus states, reduced-motion support)
- Route-level code splitting: only the home page ships in the initial bundle

## Project Structure

```
src/
  components/   Reusable UI (Header, Footer, CourseCard, LessonRow, Modal, CommandPalette…)
  pages/        Route components (Home, Course, My Learning, Leaderboard, Blogs, Links…)
  lib/          Data helpers (catalog, blog, github, analytics, share…)
  store/        Zustand stores (progress — persisted, toast, ui)
  data/         Course, video, link and announcement JSON (edit these to add content)
  blogs/        Markdown blog posts
```

## Technologies Used

- React 18 + TypeScript
- Vite
- Tailwind CSS (+ typography plugin)
- React Router
- Zustand (state management, persisted to localStorage)
- react-markdown + remark-gfm (lazy-loaded)
