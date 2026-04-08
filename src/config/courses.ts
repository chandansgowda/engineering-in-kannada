export interface CourseConfig {
  id: string;
  title: string;
  playlistId: string;
  subject: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
}

export const COURSES_CONFIG: CourseConfig[] = [
  {
    id: 'python-fundamentals',
    title: 'Python in Kannada Basics',
    playlistId: 'PLlGueSbLhZoBRnTsGiDJeTXuQCALOTN07',
    subject: 'Python',
    thumbnail: 'https://i3.ytimg.com/vi/8c74mXV2lJ0/hqdefault.jpg',
    difficulty: 'Beginner',
    description: 'Learn Python basics in Kannada from zero with real-world examples.',
  },
  {
    id: 'python-oops',
    title: 'Python OOPS in Kannada',
    playlistId: 'PLlGueSbLhZoBYR3nMpsEdtg_pf13eO0bD',
    subject: 'Python',
    thumbnail: 'https://i3.ytimg.com/vi/aXuYPVStgdk/hqdefault.jpg',
    difficulty: 'Intermediate',
    description: 'Learn Object Oriented Programming in Python in Kannada with real-world examples.',
  },
  {
    id: 'web-dev-manjunath',
    title: 'Web Development in Kannada',
    playlistId: 'PLlGueSbLhZoAd3iIu-ZsX-YPeYnxrvUwG',
    subject: 'Web Dev',
    thumbnail: 'https://i3.ytimg.com/vi/mVbsESNhDAk/hqdefault.jpg',
    difficulty: 'Beginner',
    description: 'Learn HTML, CSS and JS basics with Manjunath in Kannada with hands-on project.',
  },
  {
    id: 'c-fundamentals',
    title: 'C Programming in Kannada',
    playlistId: 'PLlGueSbLhZoCEMAeoeXoyd3NFnkR4iUP3',
    subject: 'C',
    thumbnail: 'https://i.ytimg.com/vi/0sd6OpPG2UM/hq720.jpg',
    difficulty: 'Beginner',
    description: 'Basic C Programming in Kannada crash course.',
  },
  {
    id: 'dsa-c',
    title: 'Data Structures and Algorithms in C',
    playlistId: 'PLlGueSbLhZoCNnEEoeOXICh0k4wz0hG-V',
    subject: 'DSA',
    thumbnail: 'https://i.ytimg.com/vi/iDe1fWnneCA/hq720.jpg',
    difficulty: 'Intermediate',
    description: 'Learn Data Structures and Algorithms in C in Kannada.',
  },
];

export const getCourseConfig = (id: string): CourseConfig | undefined =>
  COURSES_CONFIG.find((c) => c.id === id);
