import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LikeButtonProps {
  slug: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ slug }) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);

  useEffect(() => {
    // Load liked state from localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setIsLiked(!!likedPosts[slug]);

    // Mock likes count (since we don't have a backend)
    // We'll generate a consistent "fake" number based on the slug, starting from 10
    const hash = slug.split('').reduce((acc, char) => acc + (char.codePointAt(0) || 0), 0);
    const baseLikes = (hash % 3) + 10;
    setLikes(baseLikes + (likedPosts[slug] ? 1 : 0));
  }, [slug]);

  const handleLike = () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    const newLikedState = !isLiked;

    if (newLikedState) {
      likedPosts[slug] = true;
      setLikes(prev => prev + 1);
      
      // Trigger confetti for a premium feel
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });
    } else {
      delete likedPosts[slug];
      setLikes(prev => prev - 1);
    }

    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    setIsLiked(newLikedState);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-12 border-t border-white/10 mt-12">
      <p className="text-gray-400 text-sm font-medium">Enjoyed this post?</p>
      <button
        onClick={handleLike}
        className={`group relative flex items-center gap-3 px-8 py-3 rounded-full border-2 transition-all duration-300 ${
          isLiked 
            ? 'bg-primary/20 border-primary text-primary' 
            : 'bg-transparent border-white/20 text-gray-400 hover:border-primary hover:text-primary'
        }`}
      >
        <Heart 
          className={`w-6 h-6 transition-transform duration-300 ${isLiked ? 'fill-primary scale-125' : 'group-hover:scale-110'}`} 
        />
        <span className="font-bold text-lg">{likes}</span>
        
        {/* Subtle glow effect when liked */}
        {isLiked && (
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 animate-pulse"></div>
        )}
      </button>
      <p className="text-xs text-gray-500">
        {isLiked ? "Thanks for the support!" : "Click to show some love"}
      </p>
    </div>
  );
};
