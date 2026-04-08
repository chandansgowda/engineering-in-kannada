import React from 'react';
import announcementsData from '../data/announcements.json';
import { AnnouncementItem } from '../types';

export function AnnouncementBanner() {
  const activeItems = (announcementsData.items as AnnouncementItem[]).filter((i) => i.isActive);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (activeItems.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((p) => (p + 1) % activeItems.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(id);
  }, [activeItems.length]);

  if (activeItems.length === 0) return null;

  const item = activeItems[currentIndex];

  return (
    <div className="rounded-2xl bg-primary/10 border border-primary/20 px-5 py-3 flex items-center justify-center">
      <p className={`text-sm text-gray-200 text-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {item.content}
        {item.author && <span className="ml-2 text-primary">— {item.author}</span>}
      </p>
    </div>
  );
}
