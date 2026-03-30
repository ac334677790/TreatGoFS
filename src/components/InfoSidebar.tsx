import React, { useEffect, useState } from 'react';
import { CoinIcon } from './CoinIcon';
import { Link } from 'react-router-dom';
import { Advertisement } from './Advertisement';
import { getCurrentUserId } from '../utils/auth';
import { supabase } from '../lib/supabase';

export function InfoSidebar({ userStats, user }: { userStats: any; user: any }) {

  const [userId, setUserId] = useState('');
  
  return (
    <div className="w-96 bg-stone-800 p-4 fixed top-0 right-0 h-full hidden xl:block">
      {/* 資訊列：體力、咔滋幣、超級堅果 */}
      <div className="flex items-center justify-around bg-stone-700 p-3 rounded-lg mb-6">
        {/* 體力 */}
        <div className="flex items-center gap-2">
          <CoinIcon type="heart" size={30} className="text-red-500" />
          <span className="text-lg font-semibold text-amber-500">{userStats?.energy || 0}</span>
        </div>
        {/* 咔滋幣 */}
        <div className="flex items-center gap-2">
          <CoinIcon size={50} className="text-amber-500" />
          <span className="text-lg font-semibold text-amber-500">{userStats?.kazzi || 0}</span>
        </div>
        {/* 超級堅果 */}
        <div className="flex items-center gap-2">
          <CoinIcon type="diamond" size={40} className="text-blue-500" />
          <span className="text-lg font-semibold text-amber-500">{userStats?.gems || 0}</span>
        </div>
      </div>

      {/* 已學習總單字數 */}
      <div className="mb-6">
        <h3 className="text-md font-bold text-stone-300 mb-2">已學習單字數</h3>
        <div className="bg-stone-700 p-3 rounded-lg text-center">
          <span className="text-2xl font-bold text-amber-500">{userStats?.learned_word_count || 0}</span>
        </div>
      </div>

      {/* 購買方案廣告 */}
      <div className="mb-6">
        <h3 className="text-md font-bold text-stone-300 mb-2">升級到超級土波！</h3>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-lg text-center">
          <p className="text-white font-semibold mb-2">解鎖更多功能，學習更高效！</p>
          <Link
            to="/shop?tab=subscriptions"
            className="bg-white text-amber-500 px-4 py-2 rounded-lg font-bold hover:bg-stone-100 transition-colors"
          >
            升級方案
          </Link>
        </div>
      </div>

      {/* 每日目標進度 */}
      <div className="mb-6">
        <h3 className="text-md font-bold text-stone-300 mb-2">每日目標進度</h3>
        <div className="bg-stone-700 p-3 rounded-lg">
          <div className="relative w-full h-4 bg-stone-600 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-amber-500"
              style={{ width: `${(userStats?.dailyProgress || 0) / (userStats?.dailyGoal || 1) * 100}%` }}
            ></div>
          </div>
          <p className="text-stone-400 text-sm mt-2">
            {userStats?.dailyProgress || 0}/{userStats?.dailyGoal || 0} 單字
          </p>
        </div>
      </div>

      {/* Google 廣告 */}
      <Advertisement />
    </div>
  );
}