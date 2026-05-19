import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Settings, 
  Users, 
  BarChart3, 
  Mail, 
  HelpCircle,
  LogOut,
  Search,
  Plus
} from 'lucide-react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-columncontrol-dt'; // 必須 import
import 'datatables.net-columncontrol-dt/css/columnControl.dataTables.min.css';
import './Datatablejs.css';
import { StoreModal, ActivityModal } from './AdminModals';
import { Store } from './../mockStores';
import { supabase } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';

// 註冊 DataTables 核心組件，此處不需要 jQuery
DataTable.use(DT);

/**
 * 側邊欄導覽項目組件
 */
const NavItem = ({ icon: Icon, label, active, collapsed, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center transition-all duration-300 group relative
        ${collapsed ? 'justify-center px-2' : 'px-4'}
        ${active 
          ? 'bg-[#964696] text-white shadow-lg' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'}
        py-3 my-1 rounded-xl
      `}
    >
      <div className={`${collapsed ? '' : 'mr-3'}`}>
        <Icon size={22} />
      </div>
      
      {!collapsed && (
        <span className="flex-1 text-left font-medium overflow-hidden whitespace-nowrap">
          {label}
        </span>
      )}

      {!collapsed && badge && (
        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}

      {collapsed && (
        <div className="absolute left-20 bg-slate-900 text-white px-2 py-1 rounded text-xs invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
          {label}
        </div>
      )}
    </button>
  );
};
const chineseLanguage = {
  "processing": "處理中...",
  "loadingRecords": "載入中...",
  "paginate": {
    "first": "第一頁",
    "previous": "上一頁",
    "next": "下一頁",
    "last": "最後一頁"
  },
  "emptyTable": "目前沒有資料",
  "zeroRecords": "找不到符合的結果",
  "info": "顯示第 _START_ 至 _END_ 筆結果，共 _TOTAL_ 筆",
  "infoEmpty": "顯示第 0 至 0 筆結果，共 0 筆",
  "infoFiltered": "(從 _MAX_ 筆結果中篩選)",
  "search": "搜尋："
};

/**
 * 修正後的 DataTables 組件 (適應 Canvas 環境)
 * 在實際專案中，您應使用 npm 安裝的 datatables.net-react-dt
 */
const UserDataTable = ({ data, loading }: { data: Store[], loading: boolean }) => {
  const columns = [
    // 中間：對應你的 tableData 欄位
    { data: "name" },
    { data: "category" },
    { data: "address" },
    { data: "valid_start" },
    { data: "valid_end" },{ 
      data: "offer_details",
      render: function(data) {
        if (!data) return '<span class="text-slate-300">-</span>';
        return `<div class="whitespace-pre-wrap text-sm leading-relaxed min-w-[200px]">${data}</div>`;
      }
    },
    {
      data: "attachment_url",
      render: function(data) {
        if (!data) return '<span class="text-slate-300">-</span>';
        return `
          <a href="${data}" target="_blank" class="text-[#964696] hover:underline flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            檢視
          </a>`;
      }
    },

    // 最後一欄：按鈕
    {
      data: null,
      orderable: false,
      render: function (data, type, row) {
      // 將整筆資料轉為字串傳給編輯函數
      const rowData = JSON.stringify(row).replace(/"/g, '&quot;');
      
      return `
        <div class="flex items-center space-x-2">
          <button 
            onclick='window.onDataTableEdit(${rowData})' 
            class="p-1 text-[#964696] hover:bg-[#964696]/10 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>

          <button 
            onclick="window.onDataTableDelete(${row.id})" 
            class="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      `;
    }
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 datatable-react-wrapper relative">
      {/* 載入遮罩 */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-[#964696] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-600">資料載入中...</span>
          </div>
        </div>
      )}

      <DataTable
        key={loading ? 'loading' : `ready-${data.length}`}
        data={data}
        columns={columns}
        className="display"
        options={{
          language: chineseLanguage as any,
          processing: true,
          columnControl: [
            {
              target: 0, // 因為第一欄 (0) 是編輯按鈕，所以從 1 開始加搜尋
              content: ['order', ['searchList']]
            },
            {
              target: 1,
              content: ['searchText']
            }
          ],
          ordering: {
            indicators: false,
            handler: false
          },
          responsive: true,
        }}
      >
            <thead>
                <tr>
                    <th>商店名稱</th>
                    <th>分類</th>
                    <th>地址</th>
                    <th>特約開始</th>
                    <th>特約結束</th>
                    <th>優惠內容</th>
                    <th>附件</th>
                    <th>操作</th>
                </tr>
            </thead>
        </DataTable>
    </div>
  );
};

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('特約廠商管理');
  const [stores, setStores] = useState<Store[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true); // 預設為載入中

  // 檢查登入狀態
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 從 stores 中提取不重複的分類列表
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    stores.forEach(store => {
      if (store.category) {
        uniqueCategories.add(store.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [stores]);

  const fetchStores = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('contract_stores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      await supabase.auth.signOut();
      setStores([]);
      setUser(null);
    }
  };

  // 橋接 DataTables 的原生 JavaScript 點擊事件到 React 狀態
  useEffect(() => {
    (window as any).onDataTableEdit = (store: Store) => {
      setEditingStore(store);
      setIsModalOpen(true);
    };

    (window as any).onDataTableDelete = async (id: any) => {
      if (!window.confirm('確定要刪除這家廠商嗎？')) return;
      const { error } = await supabase.from('contract_stores').delete().eq('id', id);
      if (!error) fetchStores();
      else alert('刪除失敗：' + error.message);
    };

    return () => {
      delete (window as any).onDataTableEdit;
      delete (window as any).onDataTableDelete;
    };
  }, []);

  const getCoordinates = async (address: string) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].geometry.location;
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    return { lat: 0, lng: 0 };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    const oldAttachmentUrl = editingStore.attachment_url;
    let newAttachmentUrl: string | null = oldAttachmentUrl;

    // 1. 處理檔案上傳至 Supabase Storage
    const fileToUpload = (editingStore as any).file as File | undefined;
    if (fileToUpload) {
      const fileExt = fileToUpload.name.split('.').pop();
      let fileName: string;
      // 如果是編輯現有商店，使用商店ID作為檔名；否則使用時間戳+隨機數
      if (editingStore.id) {
        fileName = `${editingStore.id}.${fileExt}`;
      } else {
        fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      }
      const filePath = `store-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, fileToUpload, { upsert: true });

      if (uploadError) {
        alert('附件上傳失敗：' + uploadError.message);
        return;
      }

      // 取得上傳後的公開連結
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      newAttachmentUrl = urlData.publicUrl;

      // 如果原本有舊附件，且新舊附件的儲存路徑不同（例如副檔名改變），則刪除舊檔案
      if (oldAttachmentUrl && oldAttachmentUrl !== newAttachmentUrl) {
        const bucketName = 'attachments';
        const oldPath = oldAttachmentUrl.split(`${bucketName}/`)[1];
        const newPath = newAttachmentUrl.split(`${bucketName}/`)[1];
        if (oldPath && oldPath !== newPath) { // 確保不是嘗試刪除同一個檔案
          await supabase.storage.from(bucketName).remove([oldPath]);
        }
      }
    } else if (oldAttachmentUrl && !editingStore.attachment_url) {
      // 如果沒有上傳新檔案，但附件 URL 被清空了 (在 Modal 中點擊了移除按鈕)
      newAttachmentUrl = null;
    }

    // 2. 獲取座標
    const coords = await getCoordinates(editingStore.address);
    const storeData = {
      name: editingStore.name,
      category: editingStore.category,
      address: editingStore.address,
      phone: editingStore.phone,
      offer_details: editingStore.offer_details,
      attachment_url: newAttachmentUrl, // 存入新的或原本的 URL
      valid_start: editingStore.valid_start || null,
      valid_end: editingStore.valid_end || null,
      lat: coords.lat,
      lng: coords.lng,
    };

    const { error } = editingStore.id
      ? await supabase.from('contract_stores').update(storeData).eq('id', editingStore.id)
      : await supabase.from('contract_stores').insert([storeData]);

    if (!error) {
      setIsModalOpen(false);
      setEditingStore(null);
      fetchStores();
    } else {
      alert('儲存失敗：' + error.message);
    }
  };

  const handleAddClick = () => {
    setEditingStore({
      name: '', category: '', address: '', phone: '',
      offer_details: '', attachment_url: '',
      valid_start: '', valid_end: '', lat: 0, lng: 0,
    } as any);
    setIsModalOpen(true);
  };

  const menuItems = [
    { icon: Users, label: '特約廠商管理' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#964696] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 若未登入，顯示登入畫面
  if (!user) {
    return <Navigate to="/management/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* 側邊欄 */}
      <aside 
        className={`
          relative bg-[#2D3748] transition-all duration-500 ease-in-out flex flex-col
          ${isCollapsed ? 'w-20' : 'w-72'}
          h-screen sticky top-0 shadow-2xl z-20
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-[#964696] text-white p-1 rounded-full border-4 border-slate-100 hover:opacity-90 transition-all z-30"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-6 mb-4 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-[#964696] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#964696]/30">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          {!isCollapsed && (
            <h1 className="ml-3 font-bold text-xl text-white tracking-tight truncate">
              AdminPanel
            </h1>
          )}
        </div>

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              collapsed={isCollapsed}
              active={activeTab === item.label}
              onClick={() => setActiveTab(item.label)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavItem icon={HelpCircle} label="支援中心" collapsed={isCollapsed} />
          <NavItem icon={LogOut} label="登出帳號" collapsed={isCollapsed} onClick={handleLogout} />
        </div>
      </aside>

      {/* 主要內容區域 */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{activeTab}</h2>
            <p className="text-xs text-slate-500">系統管理後台</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#964696] rounded-xl hover:opacity-90 shadow-md"
            >
              <Plus size={16} /> 新增廠商
            </button>
            <div className="w-10 h-10 rounded-full bg-[#964696] border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <section>
            <div className="mb-4">
            </div>
            <UserDataTable data={stores} loading={loading} />
          </section>
        </div>
      </main>

      <StoreModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        store={editingStore} 
        onSave={handleSave}
        setStore={setEditingStore}
        categories={categories} // 傳遞分類列表
      />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4A5568; border-radius: 10px; }
      `}</style>
    </div>
  );
}