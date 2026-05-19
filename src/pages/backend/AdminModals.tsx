import React from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const formatDateForInput = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10).replace(/[\/\.]/g, '-');
};

export const StoreModal = ({ isOpen, onClose, store, onSave, setStore, categories }: any) => {
  if (!isOpen || !store) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#545454]">{store.id ? '編輯商店' : '新增商店'}</h2>
          <button 
            onClick={() => {
              onClose();
              setStore(null); // 清除編輯中的商店資料，避免下次開啟時殘留
            }} 
            className="text-slate-400 hover:text-slate-600"
          ><X size={24} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">商店名稱</label>
              <input type="text" required value={store.name || ''} onChange={e => setStore({...store, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#964696]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">分類</label>
              <select
                value={store.category || ''}
                onChange={e => setStore({...store, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#964696]"
              >
                <option value="">請選擇分類</option> {/* 預設選項 */}
                {categories && categories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">地址</label>
              <input type="text" value={store.address || ''} onChange={e => setStore({...store, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#964696]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">電話</label>
              <input type="text" value={store.phone || ''} onChange={e => setStore({...store, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium flex justify-between">優惠期間 <span className="text-xs text-slate-400">(留空為永久有效)</span></label>
              <div className="flex gap-2 items-center">
                <input type="date" value={formatDateForInput(store.valid_start)} onChange={e => setStore({...store, valid_start: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                <span>~</span>
                <input type="date" value={formatDateForInput(store.valid_end)} onChange={e => setStore({...store, valid_end: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">優惠內容</label>
              <textarea rows={8} value={store.offer_details || ''} onChange={e => setStore({...store, offer_details: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  附件上傳 
                  {store.attachment_url && (
                    <a href={store.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-[#964696] hover:underline flex items-center gap-1">
                      <FileText size={12} /> 查看現有附件
                    </a>
                  )}
                </label>
                {(store.attachment_url || store.file) && (
                  <button
                    type="button"
                    onClick={async () => {
                      // 1. 如果只是移除本次選取但尚未上傳的檔案
                      if (store.file && !store.attachment_url) {
                        setStore({ ...store, file: null });
                        return;
                      }

                      // 2. 如果要刪除已存在於 Supabase Storage 的檔案
                      if (!window.confirm('確定要從雲端儲存空間刪除此附件嗎？此動作將立即執行且無法復原。')) return;

                      try {
                        const url = store.attachment_url;
                        const bucketName = 'attachments';
                        // 提取儲存路徑 (假設結構為 .../attachments/store-attachments/filename)
                        const path = url?.split(`${bucketName}/`)[1];
                        
                        if (path) {
                          const { error } = await supabase.storage.from(bucketName).remove([path]);
                          if (error) throw error;
                        }

                        setStore({ ...store, attachment_url: null, file: null });
                      } catch (err: any) {
                        alert('刪除雲端實體檔案失敗：' + err.message);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> 移除附件
                  </button>
                )}
              </div>
              <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-[#964696]/50 transition-colors">
                <input 
                  type="file" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setStore({...store, file}); // 將 File 物件暫存於 state
                  }} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center justify-center text-slate-500">
                  {/* <Upload size={24} className="mb-2 text-[#964696]" /> */}
                  <p className="text-sm font-medium">
                    {store.file ? store.file.name : '點擊或拖曳檔案至此上傳'}
                  </p>
                  <p className="text-xs">支援 PDF、圖片等格式</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">取消</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[#964696] text-white rounded-lg hover:opacity-90">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ActivityModal = ({ isOpen, onClose, activity, onSave, setActivity }: any) => {
  if (!isOpen || !activity) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#545454]">{activity.id ? '編輯活動' : '新增活動'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">活動標題</label>
              <input type="text" required value={activity.title || ''} onChange={e => setActivity({...activity, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#964696]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">活動描述</label>
              <textarea rows={3} value={activity.content || ''} onChange={e => setActivity({...activity, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">外部連結 (選填)</label>
              <input type="text" value={activity.link_url || ''} onChange={e => setActivity({...activity, link_url: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">開始日期</label>
                <input type="date" value={formatDateForInput(activity.start_date)} onChange={e => setActivity({...activity, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">結束日期</label>
                <input type="date" value={formatDateForInput(activity.end_date)} onChange={e => setActivity({...activity, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={activity.is_active} onChange={e => setActivity({...activity, is_active: e.target.checked})} className="w-4 h-4 accent-[#964696]" />
              <span className="text-sm font-medium">立即啟用活動</span>
            </label>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">取消</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[#964696] text-white rounded-lg hover:opacity-90">儲存活動</button>
          </div>
        </form>
      </div>
    </div>
  );
};