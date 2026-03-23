# feat: Add blog engine UI, LikeButton, and Blog reading experience

## Summary
This PR introduces the complete **blog feature layer** for the "Engineering in Kannada" project — the UI, navigation, and reading experience infrastructure. No blog content is added in this PR; blog posts will be submitted individually in separate PRs.

## What's Changed

### New Components (`src/components/blogs/`)
- **`BlogCard.tsx`** — Card component for displaying blog post previews with domain tag, difficulty badge, read time, author, and tags
- **`BlogHeader.tsx`** — Hero section for the `/blogs` listing page
- **`BlogSection.tsx`** — Collapsible domain section that groups blogs by category (e.g., AI/ML, Backend, DevOps)
- **`EmptyState.tsx`** — Friendly empty state UI shown when no blogs match filters
- **`SearchBar.tsx`** — Debounced search input for filtering blogs by title/tags
- **`CategoryFilter.tsx`** — Filter pill buttons for browsing by domain
- **`TagFilter.tsx`** — Tag-level filtering for fine-grained discovery
- **`Highlighter.tsx`** — Highlights matched search terms within blog card text

### New Components (`src/components/`)
- **`LikeButton.tsx`** — Interactive like button with SVG heart animation and `localStorage`-based persistence per blog post

### Updated Pages (`src/pages/`)
- **`Blogs.tsx`** — Full blog listing page with domain-based grouping, collapsible sections, and filter/reset logic
- **`BlogPost.tsx`** — Individual blog post reading page with:
  - Markdown rendering via `react-markdown` + `remark-gfm`
  - Domain, difficulty, and read-time metadata display
  - Author with optional GitHub/LinkedIn link
  - Tags section
  - "Related Blogs" grid at the bottom
  - Integrated `LikeButton`

### Styling (`src/index.css`, `tailwind.config.js`)
- Blog-specific typography styles for Markdown prose rendering
- Tailwind `prose-invert` configuration for dark-mode content readability

## What's NOT in this PR
- ❌ No blog content files (`.md` content, `metadata.json`)
- Blog posts will be added one-by-one in separate PRs (one PR per blog)

## Testing
- Verified on Windows / Node.js with `npm run dev`
- Blog listing page renders correctly with 0 or more blog posts
- Empty state shows when no blogs are available
- Like button persists state across page reloads via `localStorage`
