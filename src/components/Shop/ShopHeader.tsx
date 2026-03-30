import React from 'react';
import { CoinIcon } from '../CoinIcon';

export function ShopHeader({ userStats }: { userStats: any }) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-amber-500">商店</h1>
      {userStats && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-800 px-3 py-1.5 rounded-lg">
            <CoinIcon size={20} className="text-amber-500" />
            <span className="text-lg font-semibold">{userStats.gems || 0}</span>
          </div>
          <div className="flex items-center gap-1 bg-stone-800 px-3 py-1.5 rounded-lg">
            <CoinIcon type="diamond" size={20} className="text-blue-500" />
            <span className="text-lg font-semibold">{userStats.diamonds || 0}</span>
          </div>
        </div>
      )}
    </header>
  );
}