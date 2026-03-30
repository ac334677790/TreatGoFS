import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// 獲取用戶地圖狀態的函數
const getUserMapState = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_user_map_state', {
    p_user_id: userId,  // 傳入用戶 ID
  });

  if (error) {
    console.error('錯誤：', error.message);
    return [];
  }

  return data;  // 返回章節與小節的資料
};

// 用於顯示用戶學習進度的組件
const UserMap = ({ userId }: { userId: string }) => {
  const [mapState, setMapState] = useState<any[]>([]);

  useEffect(() => {
    const fetchMapState = async () => {
      const data = await getUserMapState(userId);  // 獲取用戶地圖狀態
      setMapState(data);
    };

    fetchMapState();  // 初始化獲取數據
  }, [userId]);  // 當 userId 改變時重新獲取資料

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-amber-500">學習進度地圖</h1>
      <div className="space-y-4">
        {mapState.length === 0 ? (
          <div className="bg-stone-800 p-6 rounded-xl text-center">
            <p className="text-stone-400">載入中...</p>
          </div>
        ) : (
          mapState.map((chapter: any) => (
            <div key={chapter.chapter_id} className="bg-stone-800 rounded-xl p-4">
              <h2 className="text-xl text-amber-500">{chapter.chapter_title}</h2>
              <ul className="space-y-2">
                {chapter.section_id.map((section: any) => (
                  <li key={section.section_id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium text-lg text-amber-400">{section.section_title}</span>
                    </div>
                    <div className="text-sm text-stone-300">
                      Level {section.user_level} | 
                      Total Words: {section.total_words} | 
                      Learned: {section.learned_words}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserMap;
