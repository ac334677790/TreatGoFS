import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Store } from '../mockStores';

interface Props {
  stores: Store[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  columnFilters: any;
  setColumnFilters: (v: any) => void;
  onEdit: (store: Store) => void;
  onDelete: (id: number) => void;
}

const AdminStoreTable = ({ stores, loading, searchTerm, columnFilters, setColumnFilters, setSearchTerm, onEdit, onDelete }: Props) => {
  const filtered = stores.filter(store => {
    const globalMatch = !searchTerm || [store.name, store.category, store.address].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
    const nameMatch = !columnFilters.name || store.name?.toLowerCase().includes(columnFilters.name.toLowerCase());
    const catMatch = !columnFilters.category || store.category?.toLowerCase().includes(columnFilters.category.toLowerCase());
    return globalMatch && nameMatch && catMatch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
              <div className="flex flex-col gap-2">
                <span>名稱</span>
                <input type="text" placeholder="過濾..." className="font-normal text-xs px-2 py-1 border rounded" value={columnFilters.name} onChange={e => setColumnFilters({...columnFilters, name: e.target.value})} />
              </div>
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
              <div className="flex flex-col gap-2">
                <span>分類</span>
                <input type="text" placeholder="過濾..." className="font-normal text-xs px-2 py-1 border rounded" value={columnFilters.category} onChange={e => setColumnFilters({...columnFilters, category: e.target.value})} />
              </div>
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 align-top pt-5">地址</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 align-top pt-5">優惠期間</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center align-top pt-5">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            [1, 2, 3].map(i => (
              <tr key={i} className="animate-pulse">
                <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
              </tr>
            ))
          ) : filtered.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">找不到資料</td></tr>
          ) : filtered.map((store) => (
            <tr key={store.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium">{store.name}</td>
              <td className="px-6 py-4 text-sm">
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 text-[11px] font-bold">{store.category}</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{store.address}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{store.valid_start ? `${store.valid_start} ~ ${store.valid_end}` : '長期有效'}</td>
              <td className="px-6 py-4 text-sm text-center">
                <div className="flex justify-center gap-3">
                  <button onClick={() => onEdit(store)} className="p-1 text-[#964696] hover:bg-[#964696]/10 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(store.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminStoreTable;