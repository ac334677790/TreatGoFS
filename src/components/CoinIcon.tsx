import React from 'react';

type CoinIconProps = {
  className?: string;
  size?: number;
  animated?: boolean;
  type?: 'coin' | 'diamond' | 'diamond2' | 'heart';
};

export function CoinIcon({ className = "", size = 24, animated = false, type = 'coin' }: CoinIconProps) {
  if (type === 'diamond') {
    return (
      <img
        src="/images/diamond.png" // 確保 diamond.png 位於 public/images 資料夾中
        alt="Diamond"
        width={size}
        height={size}
        className={`${className} ${animated ? 'animate-pulse' : ''}`}
      />
    );
  }
  if (type === 'diamond2') {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${animated ? 'animate-pulse' : ''}`}
      >
        {/* Diamond */}
        <path 
          d="M12 2L22 8.5L12 22L2 8.5L12 2Z" 
          fill="#38BDF8" 
          stroke="#0284C7" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
        <path 
          d="M12 2L2 8.5H22L12 2Z" 
          fill="#7DD3FC" 
          stroke="#0284C7" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
        <path 
          d="M12 22L7 8.5H17L12 22Z" 
          fill="#0EA5E9" 
          stroke="#0284C7" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'coin') {
    return (
      <img
        src="/images/kazzi.png" // 確保 diamond.png 位於 public/images 資料夾中
        alt="kazzi"
        width={size}
        height={size}
        className={`${className} ${animated ? 'animate-pulse' : ''}`}
      />
    );
  }
  if (type === 'heart') {
    return (
      <img
        src="/images/heart.png" // 確保 diamond.png 位於 public/images 資料夾中
        alt="kazzi"
        width={size}
        height={size}
        className={`${className} ${animated ? 'animate-pulse' : ''}`}
      />
    );
  }
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-pulse' : ''}`}
    >
      {/* Gold coin base */}
      <circle cx="12" cy="12" r="11" fill="#F59E0B" />
      
      {/* Inner coin */}
      <circle cx="12" cy="12" r="9" fill="#FBBF24" />
      
      {/* Dollar sign */}
      <path 
        d="M12 7V9M12 15V17" 
        stroke="#7C2D12" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      <path 
        d="M8 12H16M9 9H15M9 15H15" 
        stroke="#7C2D12" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}