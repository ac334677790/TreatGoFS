import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, Phone, Search, Navigation, ExternalLink, Clock, ChevronDown, ChevronUp, Gift, FileText } from 'lucide-react';
import { Store } from './mockStores'; // 僅保留型別定義
import { supabase } from '../lib/supabase';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';


const PAGE_SIZE = 15;

const ContractStoreSearch = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [sortMode, setSortMode] = useState<'default' | 'distance'>('default'); // default, distance
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>(['全部']);

  // TanStack Table 欄位定義
  const columnHelper = createColumnHelper<Store & { distance?: number; attachment_url?: string }>();
  const columns = useMemo(() => {
    const cols: any[] = [
      columnHelper.accessor('name', {
      header: '名稱 / 分類',
      cell: (info) => (
        <div className="flex flex-col items-start gap-2 min-w-[200px]">
          <div>
            <span className="text-[10px] bg-[#964696]/10 text-[#964696] px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">
              {info.row.original.category}
            </span>
          </div>
          <div>
            <span className="font-bold text-[#545454]">{info.getValue()}</span>
          </div>
        </div>
      ),
    }),
      columnHelper.display({
      id: 'contact',
      header: '聯絡資訊',
      cell: (info) => {
        const store = info.row.original;
        return (
          <div className="text-sm text-slate-600">
            <div className="flex items-center gap-1 mb-1 truncate max-w-[200px]">
              <MapPin size={14} className="text-slate-400" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {store.address}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span className="text-slate-600">{store.phone}</span>
            </div>
            <div className="text-[14px] text-slate-400 mt-1 flex items-center gap-1">
              {/* <Clock size={14} /> {store.valid_start && store.valid_end ? `${store.valid_start} ~ ${store.valid_end}` : '長期有效'} */}
            </div>
          </div>
        );
      },
    }),
      columnHelper.accessor('offer_details', {
      header: '詳細優惠',
      cell: (info) => (
        <div className="text-sm text-[#009BAA] font-bold leading-tight whitespace-pre-wrap break-words">
          {info.getValue()}
        </div>
      ),
    }),
      columnHelper.display({
        id: 'attachment',
        header: '附件',
        cell: (info) => {
          const url = info.row.original.attachment_url;
          if (!url) return null;
          return (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#964696] hover:underline font-bold"
            >
              <FileText size={16} /> 查看
            </a>
          );
        },
      }),
    ];

    // 只有在距離排序模式（查詢附近）時才顯示距離欄位
    if (sortMode === 'distance') {
      cols.push(
        columnHelper.accessor('distance', {
          header: () => <div className="text-right">距離</div>,
          cell: (info) => {
            const dist = info.getValue();
            if (dist === undefined) return null;
            return (
              <div className="text-right text-[#009BAA] font-bold text-sm">
                {dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`}
              </div>
            );
          },
        })
      );
    }

    return cols;
  }, [sortMode, columnHelper]);

  // 監聽捲動事件
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 150);
      if (offset <= 150) setShowStickySearch(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. 取得分類清單 (初始化一次即可)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('contract_stores').select('category');
      if (data) {
        const cats = ['全部', ...Array.from(new Set(data.map((s: any) => s.category))).sort() as string[]];
        setCategories(cats);
      }
    };
    fetchCategories();
  }, []);

  // 2. 核心抓取資料函式
  const fetchStores = async (pageNum: number, isNewSearch: boolean) => {
    if (pageNum === 0) setIsLoading(true);
    else setIsFetchingMore(true);

    let query = supabase
      .from('contract_stores')
      .select('*', { count: 'exact' });

    // 伺服器端過濾
    if (selectedCategory !== '全部') {
      query = query.eq('category', selectedCategory);
    }

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await query
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching stores:', error);
    } else if (data) {
      setStores(prev => isNewSearch ? data : [...prev, ...data]);
      setHasMore(count ? (pageNum + 1) * PAGE_SIZE < count : false);
    }
    
    setIsLoading(false);
    setIsFetchingMore(false);
  };

  // 當分頁改變時抓取
  useEffect(() => {
    if (sortMode !== 'distance') {
      fetchStores(page, page === 0);
    }
  }, [page]);

  // 當搜尋或分類改變時，重置回第一頁
  useEffect(() => {
    if (sortMode === 'distance') return;
    if (page !== 0) {
      setPage(0);
    } else {
      fetchStores(0, true);
    }
  }, [searchTerm, selectedCategory]);

  // 計算距離公式 (Haversine Formula) - 回傳單位: 公里
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 2. 處理定位與距離排序
  const handleLocateMe = async () => {
    // 如果已經是距離排序模式，則點擊後取消排序並恢復原始 ID 順序
    if (sortMode === 'distance') {
      setSortMode('default');
      setUserLocation(null);
      setPage(0);
      fetchStores(0, true);
      return;
    }

    if (!navigator.geolocation) {
      alert("您的裝置不支援定位功能");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        setIsLoading(true);
        // 距離排序模式下，一次抓取較多資料進行前端排序
        const { data } = await supabase.from('contract_stores').select('*').limit(300);
        
        if (data) {
          const storesWithDistance = data.map(store => ({
            ...store,
            distance: calculateDistance(latitude, longitude, store.lat, store.lng)
          })).sort((a, b) => a.distance - b.distance);
          
          setStores(storesWithDistance);
          setSortMode('distance');
          setHasMore(false); // 距離模式下暫時關閉分頁
        }
        setIsLoading(false);
      },
      (error: GeolocationPositionError) => {
        console.error(error);
        alert("無法取得位置，請確認瀏覽器權限");
        setIsLoading(false);
      }
    );
  };

  // 切換展開狀態
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 3. 無限捲動監聽
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore && sortMode === 'default') {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingMore, sortMode]);

  // 初始化 TanStack Table
  const table = useReactTable({
    data: stores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 固定在頂部的導覽列 */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-[#545454] flex items-center gap-2">
            特約商店查詢
          </h1>
          
          {/* 捲動後顯示在右上角的搜尋按鈕 */}
          {isScrolled && (
            <button 
              onClick={() => setShowStickySearch(!showStickySearch)}
              className={`p-2 rounded-full transition-all ${showStickySearch ? 'bg-[#964696] text-white' : 'bg-slate-100 text-[#964696] hover:bg-slate-200'}`}
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* 捲動時點開顯示的搜尋控制列 */}
        {isScrolled && showStickySearch && (
          <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 p-4 animate-in slide-in-from-top duration-200">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-2">
              <SearchControls 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                handleLocateMe={handleLocateMe}
                sortMode={sortMode}
                compact={true}
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* 控制面板：搜尋與定位 */}
        <div className={isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : 'mb-6 transition-all duration-300'}>
          <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col md:flex-row gap-2">
            <SearchControls 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              handleLocateMe={handleLocateMe}
              sortMode={sortMode}
            />
          </div>
        </div>

        {/* 狀態顯示 */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">載入資料中...</div>
        ) : (
          <>
            <div className="text-sm text-slate-500 mb-4 flex justify-between items-end">
              <span>已顯示 {stores.length} 家廠商</span>
              {userLocation && <span className="text-xs text-[#009BAA] font-bold">● 已定位目前位置</span>}
            </div>

            {/* 手機版：卡片清單 (MD 以下顯示) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {stores.map((store) => (
                <div key={store.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                    {/* 卡片頭部：分類與距離 */}
                    <div className="border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
                      <span className="inline-block bg-white border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                        {store.category}
                      </span>
                      {sortMode === 'distance' && store.distance !== undefined && (
                        <span className="text-[#009BAA] font-bold text-sm flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {store.distance < 1 
                            ? `${(store.distance * 1000).toFixed(0)} m` 
                            : `${store.distance.toFixed(1)} km`}
                        </span>
                      )}
                    </div>

                    {/* 卡片內容 */}
                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-bold text-[#545454] mb-2">{store.name}</h3>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#964696] hover:underline text-left leading-tight whitespace-pre-wrap break-words"
                          >
                            {store.address}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <a href={`tel:${store.phone}`} className="hover:text-[#964696]">
                            {store.phone}
                          </a>
                        </div>
                        {/* <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            優惠期間：{store.valid_start && store.valid_end ? `${store.valid_start} ~ ${store.valid_end}` : '長期有效'}
                          </span>
                        </div> */}
                      </div>
                    </div>
                    
                    {/* 優惠內容區塊 (摺疊) */}
                    {expandedId === store.id && (
                      <div className="bg-[#009BAA]/5 px-4 py-3 border-t border-[#009BAA]/10 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-sm text-[#009BAA] font-bold whitespace-pre-wrap break-words">
                          {store.offer_details}
                        </p>
                      </div>
                    )}
                    
                    {/* 底部按鈕列 */}
                    <div className={`grid ${store.attachment_url ? 'grid-cols-4' : 'grid-cols-3'} border-t border-slate-100`}>
                      <button 
                        onClick={() => toggleExpand(store.id)}
                        className={`flex items-center justify-center gap-1 py-3 text-sm font-bold border-r border-slate-100 transition-colors ${
                          expandedId === store.id ? 'bg-[#009BAA] text-white' : 'bg-white text-[#009BAA] hover:bg-slate-50'
                        }`}
                      >
                        <Gift size={16} /> {expandedId === store.id ? '收合' : '詳情'}
                      </button>
                      <a 
                        href={`tel:${store.phone}`}
                        className="flex items-center justify-center gap-1 py-3 bg-white hover:bg-slate-50 text-[#964696] text-sm font-bold border-r border-slate-100 transition-colors"
                      >
                        <Phone size={16} /> 撥打
                      </a>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1 py-3 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold transition-colors"
                      >
                        <Navigation size={16} /> 地圖
                      </a>
                      {store.attachment_url && (
                        <a 
                          href={store.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 py-3 bg-white hover:bg-slate-50 text-[#964696] text-sm font-bold transition-colors"
                        >
                          <FileText size={16} /> 附件
                        </a>
                      )}
                    </div>
                  </div>
              ))}
            </div>

            {/* 電腦版：表格清單 (MD 以上顯示) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 md:top-0 z-10 shadow-sm">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-6 py-3 text-xs font-bold text-[#545454] uppercase tracking-wider bg-slate-50">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 載入更多偵測點 */}
            <div ref={loaderRef} className="py-10 flex justify-center">
              {isFetchingMore && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-5 h-5 border-2 border-[#964696] border-t-transparent rounded-full animate-spin"></div>
                  載入中...
                </div>
              )}
            </div>

            {stores.length === 0 && !isLoading && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">沒有找到符合 "{searchTerm}" 的廠商</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-[#964696] hover:underline"
                >
                  清除搜尋
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const SearchControls = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories, handleLocateMe, sortMode, compact = false }: any) => (
  <>
    <div className="relative flex-grow">
      <Search className={`absolute left-3 ${compact ? 'top-2.5 w-4 h-4' : 'top-3 w-5 h-5'} text-slate-400`} />
      <input 
        type="text"
        placeholder="搜尋廠商..."
        className={`w-full pl-10 pr-4 ${compact ? 'py-2 text-sm' : 'py-3'} border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#964696] bg-slate-50 transition-all`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex gap-2">
      <select 
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className={`bg-slate-50 border border-slate-200 rounded-lg px-3 ${compact ? 'py-2 text-xs' : 'py-2.5 text-sm'} outline-none focus:ring-2 focus:ring-[#964696] text-slate-600 font-medium cursor-pointer flex-grow md:flex-grow-0`}
      >
        {categories.map((cat: string) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <button 
        onClick={handleLocateMe}
        className={`flex items-center justify-center gap-2 px-4 rounded-lg font-medium transition-all active:scale-95 whitespace-nowrap flex-grow md:flex-grow-0 ${compact ? 'py-2 text-xs' : 'py-2.5 text-sm'} ${
          sortMode === 'distance' 
            ? 'bg-[#009BAA] text-white shadow-md' 
            : 'bg-[#964696] text-white hover:opacity-90 shadow-md'
        }`}
      >
        <Navigation className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${sortMode === 'distance' ? 'fill-current' : ''}`} />
        {compact ? (sortMode === 'distance' ? '取消排序' : '定位') : (sortMode === 'distance' ? '取消距離排序' : '查詢附近廠商')}
      </button>
    </div>
  </>
);

export default ContractStoreSearch;
