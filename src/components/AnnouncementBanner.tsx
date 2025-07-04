import React from 'react';
import { useTranslation } from 'react-i18next';
import announcementsData from '../data/announcements.json';
import { AnnouncementItem } from '../types';

export function AnnouncementBanner() {
  const { t } = useTranslation();
  const activeItems = announcementsData.items.filter(item => item.isActive);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (activeItems.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeItems.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeItems.length]);

  if (activeItems.length === 0) return null;

  const currentItem = activeItems[currentIndex] as AnnouncementItem & { contentKey: string };

  return (
    <div className="rounded-lg bg-primary/10 p-4 backdrop-blur-sm">
      <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-center text-sm text-white">{t(currentItem.contentKey)}</p>
      </div>
    </div>
  );
} 
