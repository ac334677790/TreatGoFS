import React from 'react';

export function RewardProgress({ progress, totalWords }: any) {
  const percentage = Math.floor((progress / totalWords) * 100);

  return (
    <div className="mb-4">
      {/* <label className="block text-sm text-stone-400 mb-1">Mining Progress:</label> */}
      <div className="h-2 bg-stone-700 rounded overflow-hidden">
        <div 
          className="h-full bg-amber-500 transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* <div className="text-right text-sm text-stone-400 mt-1">
        {percentage}% completed ({progress} / {totalWords} words)
      </div> */}
    </div>
  );
}