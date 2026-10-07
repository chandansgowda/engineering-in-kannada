import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";

// The home page ships in the main bundle; every other route is code-split.
const named = <T extends string>(loader: () => Promise<Record<T, React.ComponentType>>, name: T) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

const CoursePage = named(() => import("./pages/CoursePage"), "CoursePage");
const LearningPage = named(() => import("./pages/LearningPage"), "LearningPage");
const LeaderboardPage = named(() => import("./pages/LeaderboardPage"), "LeaderboardPage");
const BlogsPage = named(() => import("./pages/BlogsPage"), "BlogsPage");
const BlogPostPage = named(() => import("./pages/BlogPostPage"), "BlogPostPage");
const LinksPage = named(() => import("./pages/LinksPage"), "LinksPage");
const TermsPage = named(() => import("./pages/TermsPage"), "TermsPage");
const PrivacyPage = named(() => import("./pages/PrivacyPage"), "PrivacyPage");
const NotFoundPage = named(() => import("./pages/NotFoundPage"), "NotFoundPage");

/** Route table shared by the browser app and the build-time prerenderer. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<HomePage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
