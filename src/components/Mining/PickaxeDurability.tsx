import React, { useEffect, useState } from 'react';
import { Pickaxe } from 'lucide-react';

export function PickaxeDurability({ durability, onRestore,isMobile =false }: any) {

  const [pickaxeClass, setPickaxeClass] = useState('');
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    if (!isFirst) {
      setPickaxeClass('animate-pixageBroken');
      const timer = setTimeout(() => setPickaxeClass(''), 400);
      return () => clearTimeout(timer);
    }
    else {
      setIsFirst(false);
    }

  }, [durability]);

  return (
    !isMobile ?(
    <div className={`mb-4 ${pickaxeClass}`}>
      {/* 十字鎬耐久度顯示 */}
      <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-900">
      <Pickaxe className="w-6 h-6 text-amber-200" />
          </div>
        
        <span className="text-lg font-semibold text-amber-900">x {durability}</span>
      </div>
      {/* {durability === 0 && (
        <button
          onClick={onRestore}
          className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <Pickaxe className="w-5 h-5" />
          Restore Pickaxe (10 💎)
        </button>
      )} */}
    </div>
    ):(
        <div className={`mb-4 ${pickaxeClass}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-900">
              <Pickaxe className="w-4 h-4 text-amber-200" />
            </div>
            <span className="text-lg font-semibold text-amber-900">x {durability}</span>
          </div>
        </div >
      )
  );
}