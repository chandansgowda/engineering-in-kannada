import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen } from 'lucide-react';
import { Course } from '../types';
import { getTotalVideos } from '../utils/courseUtils';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400',
  Intermediate: 'bg-amber-500/20 text-amber-400',
  Advanced: 'bg-red-500/20 text-red-400',
};

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
    getTotalVideos(course.id).then(setTotalVideos);
  }, [course.id]);

  return (
    <div
      onClick={() => navigate(`/course/${course.id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-dark-2 border border-white/10
                 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60
                 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />

        {/* Difficulty badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${DIFFICULTY_COLORS[course.difficulty] ?? 'bg-white/10 text-white'}`}>
            {course.difficulty}
          </span>
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
            <Play className="h-6 w-6 text-dark fill-dark ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs text-gray-400">{totalVideos} videos</span>
        </div>
        <h3 className="text-base font-semibold text-white leading-snug mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{course.description}</p>

        <button className="w-full py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium
                           group-hover:bg-primary group-hover:text-dark transition-all duration-300">
          Watch Now
        </button>
      </div>
    </div>
  );
}
