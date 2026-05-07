import React from 'react';

const Loader = ({ 
  size = 'medium', 
  fullScreen = false, 
  variant = 'spinner',
  text = '',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${sizeClasses[size]}`} />
        );
      case 'dots':
        return (
          <div className="flex gap-1">
            <div className={`bg-indigo-600 rounded-full animate-pulse ${sizeClasses[size]}`} />
            <div className={`bg-indigo-600 rounded-full animate-pulse ${sizeClasses[size]} animation-delay-200`} />
            <div className={`bg-indigo-600 rounded-full animate-pulse ${sizeClasses[size]} animation-delay-400`} />
          </div>
        );
      case 'skeleton':
        return (
          <div className="animate-pulse space-y-2">
            <div className={`bg-gray-200 rounded ${sizeClasses[size]}`} />
            <div className={`bg-gray-200 rounded w-3/4 ${sizeClasses[size]}`} />
            <div className={`bg-gray-200 rounded w-1/2 ${sizeClasses[size]}`} />
          </div>
        );
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${sizeClasses[size]}`} />
        );
    }
  };

  const loader = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {renderLoader()}
      {text && (
        <p className="text-sm text-gray-500 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
