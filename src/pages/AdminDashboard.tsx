import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Store } from './mockStores';
import { Edit2, Trash2, Plus, ArrowLeft, Upload, X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const AdminDashboard = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // 新增各欄位搜尋狀態
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    category: '',
    address: '',
  });

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contract_stores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleEditClick = (store: Store) => {
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

  // 輔助函式：地理編碼 (地址轉經緯度)
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

    // 儲存前自動根據地址取得經緯度
    const coords = await getCoordinates(editingStore.address);

    const storeData = {
      name: editingStore.name,
      category: editingStore.category,
      address: editingStore.address,
      phone: editingStore.phone,
      offer_details: editingStore.offer_details,
      attachment_url: editingStore.attachment_url,
      valid_start: editingStore.valid_start,
      valid_end: editingStore.valid_end,
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('確定要刪除這家廠商嗎？')) return;
    const { error } = await supabase.from('contract_stores').delete().eq('id', id);
    if (!error) fetchStores();
  };

  // 綜合過濾邏輯：全域搜尋 + 各欄位搜尋
  const filteredStores = stores.filter(store => {
    // 全域關鍵字搜尋 (OR 邏輯)
    const globalMatch = !searchTerm || [store.name, store.category, store.address].some(
      val => val?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 各欄位精確搜尋 (AND 邏輯)
    const nameMatch = !columnFilters.name || store.name?.toLowerCase().includes(columnFilters.name.toLowerCase());
    const categoryMatch = !columnFilters.category || store.category?.toLowerCase().includes(columnFilters.category.toLowerCase());
    const addressMatch = !columnFilters.address || store.address?.toLowerCase().includes(columnFilters.address.toLowerCase());

    return globalMatch && nameMatch && categoryMatch && addressMatch;
  });

  // 清除所有過濾條件
  const clearFilters = () => {
    setSearchTerm('');
    setColumnFilters({
      name: '',
      category: '',
      address: '',
    });
  };

  // TanStack Table 欄位定義
  const columnHelper = createColumnHelper<Store>();
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => <span className="text-slate-500 text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: '名稱',
      cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span>,
    }),
    columnHelper.accessor('category', {
      header: '分類',
      cell: info => (
        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 text-xs">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('address', {
      header: '地址',
      cell: info => <div className="text-slate-600 min-w-[200px] max-w-[300px] truncate">{info.getValue()}</div>,
    }),
    columnHelper.display({
      id: 'valid_period',
      header: '優惠期間',
      cell: info => {
        const store = info.row.original;
        return (
          <span className="text-slate-500 whitespace-nowrap">
            {store.valid_start && store.valid_end ? `${store.valid_start} ~ ${store.valid_end}` : '長期有效'}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-center">操作</div>,
      cell: info => (
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => handleEditClick(info.row.original)}
            className="text-[#964696] hover:opacity-70 transition-colors"
            title="編輯"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => handleDelete(info.row.original.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="刪除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ], []);

  // 初始化 Table 實例
  const table = useReactTable({
    data: filteredStores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Link to="/" className="text-[#964696] flex items-center gap-1 mb-2 hover:underline font-medium">
              <ArrowLeft size={16} /> 返回搜尋頁
            </Link>
            <h1 className="text-2xl font-bold text-[#545454]">廠商資料管理後台</h1>
          </div>
          <div className="flex flex-col md:flex-row gap-3 flex-grow max-w-2xl justify-end">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="搜尋名稱、分類或地址..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#964696] bg-white transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <Link to="/admin/upload" className="flex items-center gap-2 bg-[#009BAA] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors shadow-sm">
              <Upload size={18} /> 批次上傳
            </Link>
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-[#964696] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors shadow-sm"
            >
              <Plus size={18} /> 新增廠商
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-2">
          <button 
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-[#964696] underline"
          >
            清除所有搜尋條件
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {/* <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  ID
                </th> */}
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  <div className="flex flex-col gap-2">
                    <span>名稱</span>
                    <input 
                      type="text" 
                      placeholder="搜尋名稱..." 
                      className="font-normal text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-[#964696] outline-none"
                      value={columnFilters.name}
                      onChange={(e) => setColumnFilters({...columnFilters, name: e.target.value})}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  <div className="flex flex-col gap-2">
                    <span>分類</span>
                    <input 
                      type="text" 
                      placeholder="搜尋分類..." 
                      className="font-normal text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-[#964696] outline-none"
                      value={columnFilters.category}
                      onChange={(e) => setColumnFilters({...columnFilters, category: e.target.value})}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  <div className="flex flex-col gap-2">
                    <span>地址</span>
                    <input 
                      type="text" 
                      placeholder="搜尋地址..." 
                      className="font-normal text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-[#964696] outline-none"
                      value={columnFilters.address}
                      onChange={(e) => setColumnFilters({...columnFilters, address: e.target.value})}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 align-top whitespace-nowrap">優惠期間</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center align-top whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">載入中...</td></tr>
              ) : filteredStores.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">找不到符合條件的廠商</td></tr>
              ) : filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  {/* <td className="px-6 py-4 text-sm text-slate-500">{store.id}</td> */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{store.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 text-xs">
                      {store.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 min-w-[200px]">{store.address}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {store.valid_start && store.valid_end ? `${store.valid_start} ~ ${store.valid_end}` : '長期有效'}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleEditClick(store)}
                        className="text-[#964696] hover:opacity-70 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(store.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 編輯 Modal */}
      {isModalOpen && editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#545454]">{editingStore.id ? '編輯商店資料' : '新增商店資料'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">商店名稱</label>
                  <input 
                    type="text" 
                    required
                    value={editingStore.name || ''}
                    onChange={e => setEditingStore(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">分類</label>
                  <input 
                    type="text"
                    value={editingStore.category || ''}
                    onChange={e => setEditingStore(prev => prev ? {...prev, category: e.target.value} : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">地址</label>
                  <input 
                    type="text"
                    value={editingStore.address || ''}
                    onChange={e => setEditingStore(prev => prev ? {...prev, address: e.target.value} : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">電話</label>
                  <input 
                    type="text"
                    value={editingStore.phone || ''}
                    onChange={e => setEditingStore(prev => prev ? {...prev, phone: e.target.value} : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">優惠期間</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date"
                      value={editingStore.valid_start?.replace(/\//g, '-') || ''}
                      onChange={e => setEditingStore(prev => prev ? {...prev, valid_start: e.target.value} : null)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <span>~</span>
                    <input 
                      type="date"
                      value={editingStore.valid_end?.replace(/\//g, '-') || ''}
                      onChange={e => setEditingStore(prev => prev ? {...prev, valid_end: e.target.value} : null)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">優惠內容</label>
                  <textarea 
                    rows={3}
                    value={editingStore.offer_details || ''}
                    onChange={e => setEditingStore(prev => prev ? {...prev, offer_details: e.target.value} : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">附件網址 (PDF 或圖片連結)</label>
                  <input 
                    type="text"
                    value={editingStore.attachment_url || ''}
                    onChange={e => setEditingStore(prev => prev ? {...prev, attachment_url: e.target.value} : null)}
                    placeholder="https://example.com/file.pdf"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#964696] text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                >
                  儲存變更
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;