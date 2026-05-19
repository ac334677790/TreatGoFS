import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Store } from './mockStores';
import { LogOut, Lock, LogIn, LayoutDashboard, Store as StoreIcon, Megaphone, Upload, ChevronRight, Search, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminStoreTable from './AdminStoreTable';
import AdminActivityTable from './AdminActivityTable';
import { StoreModal, ActivityModal } from './backend/AdminModals';

const AdminDashboard = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stores' | 'activities'>('stores');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true); // 驗證登入中
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 抓取資料中
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    category: '',
    address: '',
  });

  const fetchStores = async () => {
    console.log('Fetching stores from Supabase...');
    setLoading(true);
    const { data, error } = await supabase
      .from('contract_stores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setStores(data);
    setLoading(false);
  };

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setActivities(data);
    setLoading(false);
  };

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

  // 當使用者登入成功後再抓取資料
  useEffect(() => {
    console.log('User state changed:', user);
    if (user) {
      if (activeTab === 'stores') {
        fetchStores();
      } else {
        fetchActivities();
      }
    }
  }, [activeTab,user]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      if (error) throw error;
      if (data.user) setUser(data.user);
    } catch (error: any) {
      alert('登入失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      await supabase.auth.signOut();
      setStores([]);
    }
  };

  const handleEditClick = (store: Store) => {
    if (store.valid_start) {
      console.info('Editing store:', store.valid_start.substring(0, 10).replace(/\./g, '/'));
    }
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingStore({
      name: '',
      category: '',
      address: '',
      phone: '',
      offer_details: '',
      attachment_url: '',
      valid_start: '',
      valid_end: '',
      lat: 0,
      lng: 0,
    } as any);
    setIsModalOpen(true);
  };

  const getCoordinates = async (address: string) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].geometry.location; // Google 回傳格式為 { lat, lng }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    return { lat: 0, lng: 0 };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    const oldAttachmentUrl = editingStore.attachment_url; // 儲存原始的附件 URL
    let newAttachmentUrl: string | null = oldAttachmentUrl; // 將要儲存到資料庫的 URL

    // 處理檔案上傳
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
        .upload(filePath, fileToUpload);

      if (uploadError) {
        alert('附件上傳失敗：' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      newAttachmentUrl = urlData.publicUrl;

      // 如果原本有舊附件，且新舊附件的儲存路徑不同，則刪除舊檔案
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
    } // 否則 (沒有上傳新檔案，且附件 URL 未被清空)，newAttachmentUrl 保持為 oldAttachmentUrl

    // 儲存前自動根據地址取得經緯度
    const coords = await getCoordinates(editingStore.address);

    const storeData = {
      name: editingStore.name,
      category: editingStore.category,
      address: editingStore.address,
      phone: editingStore.phone,
      offer_details: editingStore.offer_details,
      attachment_url: newAttachmentUrl,
      valid_start: editingStore.valid_start || null, // 空字串轉為 null 存入資料庫
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

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    const activityData = {
      title: editingActivity.title,
      content: editingActivity.content,
      link_url: editingActivity.link_url,
      start_date: editingActivity.start_date || null,
      end_date: editingActivity.end_date || null,
      is_active: editingActivity.is_active ?? true,
    };

    const { error } = editingActivity.id
      ? await supabase.from('activities').update(activityData).eq('id', editingActivity.id)
      : await supabase.from('activities').insert([activityData]);

    if (!error) {
      setIsModalOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } else {
      alert('儲存失敗：' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('確定要刪除這家廠商嗎？')) return;
    const { error } = await supabase.from('contract_stores').delete().eq('id', id);
    if (!error) fetchStores();
  };

  const handleDeleteActivity = async (id: number) => {
    if (!window.confirm('確定要刪除這個活動嗎？')) return;
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) fetchActivities();
  };

  if (authLoading) return <DashboardSkeleton />;

  // 若未登入，顯示登入畫面
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#964696]/10 p-3 rounded-full mb-4">
              <Lock className="text-[#964696]" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#545454]">管理後台登入</h1>
            <p className="text-slate-400 text-sm mt-1">請輸入管理員帳號密碼</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">電子郵件</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none transition-all"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#964696] text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <LogIn size={20} /> {loading ? '登入中...' : '登入'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'stores', label: '廠商管理', icon: StoreIcon },
    { id: 'activities', label: '活動管理', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* 側邊導覽列 */}
      <aside className="w-full md:w-64 bg-[#2D3748] text-white flex-shrink-0 flex flex-col min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#964696] p-2 rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <h2 className="font-bold text-xl tracking-wider">管理系統</h2>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#964696] text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            <Link 
              to="/admin/upload"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Upload size={20} />
              <span className="font-medium">批次上傳廠商</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="mb-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">目前帳號</p>
            <p className="text-xs text-slate-300 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-sm text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            <LogOut size={16} /> 登出系統
          </button>
        </div>
      </aside>

      {/* 主內容區塊 */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* 頂部標題列 */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/" className="hover:text-[#964696]">TreatGo</Link>
              <ChevronRight size={12} />
              <span>管理後台</span>
              <ChevronRight size={12} />
              <span className="text-slate-600 font-medium">
                {activeTab === 'stores' ? '廠商管理' : '活動管理'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'stores' ? '特約廠商清單' : '最新活動管理'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'stores' ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="快速搜尋..."
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#964696] outline-none text-sm w-48 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleAddClick}
                  className="flex items-center gap-2 bg-[#964696] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm font-bold text-sm"
                >
                  <Plus size={18} /> 新增廠商
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setEditingActivity({ title: '', content: '', is_active: true }); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-[#964696] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm font-bold text-sm"
              >
                <Plus size={18} /> 新增活動
              </button>
            )}
          </div>
        </header>

        <div className="flex-grow overflow-auto p-8">
          {activeTab === 'stores' ? (
            <AdminStoreTable 
              stores={stores} 
              loading={loading} 
              searchTerm={searchTerm} 
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              setSearchTerm={setSearchTerm}
              onEdit={handleEditClick} 
              onDelete={handleDelete} 
            />
          ) : (
            <AdminActivityTable 
              activities={activities} 
              loading={loading} 
              onEdit={(act) => { setEditingActivity(act); setIsModalOpen(true); }} 
              onDelete={handleDeleteActivity} 
            />
          )}
        </div>
      </main>

      <StoreModal 
        isOpen={isModalOpen && activeTab === 'stores'} 
        onClose={() => setIsModalOpen(false)} 
        store={editingStore} 
        onSave={handleSave} 
        setStore={setEditingStore}
        categories={categories} // 傳遞分類列表
      />
      <ActivityModal 
        isOpen={isModalOpen && activeTab === 'activities'} 
        onClose={() => setIsModalOpen(false)} 
        activity={editingActivity} 
        onSave={handleSaveActivity} 
        setActivity={setEditingActivity} 
      />
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 flex animate-pulse">
    <div className="w-64 bg-slate-200 hidden md:block"></div>
    <div className="flex-grow flex flex-col p-8 gap-6">
      <div className="h-12 bg-white rounded-xl w-1/3"></div>
      <div className="h-64 bg-white rounded-2xl"></div>
    </div>
  </div>
);

export default AdminDashboard;