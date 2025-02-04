import React from 'react';

export const Button = ({ children, onClick, variant, size, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border transition-colors duration-200 
        ${variant === 'outline' ? 'border-blue-500 text-blue-500' : 'bg-blue-500 text-white'} 
        ${size === 'sm' ? 'text-sm' : 'text-base'} 
        ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
