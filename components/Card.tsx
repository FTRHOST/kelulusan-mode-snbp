import React from 'react';
import { DotsHorizontalIcon } from './icons.tsx';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.ts';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  headerContent?: React.ReactNode; // For custom content in header besides title
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', headerContent, noPadding = false }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`bg-card-bg rounded-xl shadow-card ${className} transition-all duration-700 ease-out ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {(title || headerContent) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {title && <h2 className={`text-lg font-semibold text-text-primary ${titleClassName}`}>{title}</h2>}
          {headerContent}
          {!headerContent && title && ( // Only show dots if there's a title and no custom header content
            <button className="text-gray-400 hover:text-gray-600">
              <DotsHorizontalIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 md:p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
