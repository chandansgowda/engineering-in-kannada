import React from 'react';
import { Share2 } from 'lucide-react'; // Corrected icon name

interface ShareButtonProps {
  url?: string;
  title?: string;
  className?: string; // Allow custom styling
}

export const ShareButton: React.FC<ShareButtonProps> = ({ url, title, className }) => {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle, // Some platforms use text, others title.
          url: shareUrl,
        });
        // console.log('Content shared successfully');
      } catch (error) {
        // console.error('Error sharing:', error);
        // Don't alert if user cancels share dialog (AbortError)
        if ((error as Error).name !== 'AbortError') {
          alert('Sharing failed.');
        }
      }
    } else {
      alert('Web Share API not supported in your browser.');
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent click event from bubbling up (e.g., if on a card)
        e.preventDefault(); // Prevent default anchor behavior if wrapped in one
        handleShare();
      }}
      className={`p-2 rounded-full hover:bg-white/20 transition-colors text-gray-300 hover:text-white ${className}`}
      aria-label="Share"
      title="Share"
    >
      <Share2 size={18} />
    </button>
  );
};

export default ShareButton;
