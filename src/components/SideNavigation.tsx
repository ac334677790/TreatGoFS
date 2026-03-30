import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, MessageSquare, ShoppingCart, User, LogOut, Heart, Coins, Diamond } from 'lucide-react';
import { Logo } from './Logo';
import { clearGuestUid } from '../utils/auth';
import { supabase } from '../lib/supabase';
import { CoinIcon } from './CoinIcon';

export function SideNavigation({ userStats }: { userStats: any }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    clearGuestUid();
    await supabase.auth.signOut();
    navigate('/overview');
  };

  return (
    <div>
      {/* 體力和貨幣資訊 (固定在頂部，手機顯示) */}
      <div className="fixed top-0 left-0 w-full bg-stone-900 z-50 lg:hidden">
        <div className="bg-stone-700 p-3 rounded-lg">
          {/* 體力、咔滋幣、超級堅果 */}
          <div className="flex items-center justify-around">
            {/* 網站名稱 */}
            {/* <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-500">Tubosu</h1>
            </div> */}
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
        </div>
      </div>


      {/* 側邊導航欄 (大螢幕) */}
      <div className="w-64 bg-stone-800 p-4 fixed top-0 left-0 h-full hidden xl:flex flex-col z-50">
        <div className="flex items-center justify-center px-4 mb-8">
          <Logo size="md" />
        </div>

        {/* 上方導航區塊 */}
        <nav className="flex-1 flex flex-col gap-2 text-2xl">
          <Link
            to="/"
            className={`flex items-center px-4 py-3 mx-4 rounded-lg transition-colors ${
              isActive('/')
                ? 'bg-amber-600 text-white'
                : 'text-amber-500 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <Map className="w-5 h-5 mr-3" />
            地圖
          </Link>
          <Link
            to="/shop"
            className={`flex items-center px-4 py-3 mx-4 rounded-lg transition-colors ${
              isActive('/shop')
                ? 'bg-amber-600 text-white'
                : 'text-amber-500 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            商店
          </Link>
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 mx-4 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-amber-600 text-white'
                : 'text-amber-500 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            個人資訊
          </Link>
          <Link
            to="/feedback"
            className={`flex items-center px-4 py-3 mx-4 rounded-lg transition-colors ${
              isActive('/feedback')
                ? 'bg-amber-600 text-white'
                : 'text-amber-500 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            回饋
          </Link>
        </nav>

        {/* 登出按鈕 */}
        <div className="px-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-lg transition-colors text-amber-500 hover:bg-stone-700 hover:text-white text-left"
          >
            <LogOut className="w-5 h-5 mr-3" />
            登出
          </button>
        </div>
      </div>

      {/* 底部導航欄 (小屏幕) */}
      <div className="fixed bottom-0 left-0 w-full bg-stone-800 p-4 flex justify-around items-center z-50 lg:hidden">
        <Link
          to="/"
          className={`flex flex-col items-center ${
            isActive('/')
              ? 'text-amber-500'
              : 'text-white hover:text-amber-500'
          }`}
        >
          <Map className="w-6 h-6" />
          <span className="text-xs">地圖</span>
        </Link>
        <Link
          to="/shop"
          className={`flex flex-col items-center ${
            isActive('/shop')
              ? 'text-amber-500'
              : 'text-white hover:text-amber-500'
          }`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-xs">商店</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center ${
            isActive('/profile')
              ? 'text-amber-500'
              : 'text-white hover:text-amber-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">個人資訊</span>
        </Link>
        <Link
          to="/feedback"
          className={`flex flex-col items-center ${
            isActive('/feedback')
              ? 'text-amber-500'
              : 'text-white hover:text-amber-500'
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs">回饋</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-white hover:text-red-500"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">登出</span>
        </button>
      </div>
    </div>
  );
}