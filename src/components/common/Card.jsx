import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '', 
  headerClassName = '',
  bodyClassName = '',
  onClick = null
}) => {
  const cardClasses = `bg-white rounded-lg shadow-md overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {title && (
        <div className={`px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium ${headerClassName}`}>
          {title}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;