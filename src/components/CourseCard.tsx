import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Course } from "../types";
import { BookOpen, Star } from "lucide-react";
import { useProgressStore } from "../store/progress";
import ShareButton from "./ShareButton"; // Import the new ShareButton
import { getTotalVideos } from "../utils/courseUtils";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();
  const { toggleCourseStarred, isCourseStarred } = useProgressStore();
  const isStarred = isCourseStarred(course.id);
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
    getTotalVideos(course.id).then((count) => setTotalVideos(count));
  }, [course.id]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCourseStarred(course.id);
  };

  return (
    <div
      onClick={() => navigate(`/course/${course.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <button
          onClick={handleStarClick}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isStarred
              ? "bg-primary text-dark"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={isStarred ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star
            className="h-5 w-5"
            fill={isStarred ? "currentColor" : "none"}
          />
        </button>
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            {course.difficulty}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm text-gray-400">{totalVideos} videos</span>
        </div>
        <h3 className="mt-2 text-xl font-semibold text-white">
          {course.title}
        </h3>
        <p className="mt-2 text-gray-400">{course.description}</p>
        {course && course.id && course.title && (
          <div className="mt-4 flex justify-end"> {/* onClick prop removed here as ShareButton handles its own click */}
            <ShareButton
              url={`${window.location.origin}/course/${course.id}`}
              title={course.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}
