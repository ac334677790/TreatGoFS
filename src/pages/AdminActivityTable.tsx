import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface Props {
  activities: any[];
  loading: boolean;
  onEdit: (act: any) => void;
  onDelete: (id: number) => void;
}

const AdminActivityTable = ({ activities, loading, onEdit, onDelete }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">活動標題</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">狀態</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600">顯示期間</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={4} className="px-6 py-10 text-center">載入活動中...</td></tr>
          ) : activities.map((act) => (
            <tr key={act.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-800">{act.title}</td>
              <td className="px-6 py-4 text-sm text-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${act.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {act.is_active ? '啟用中' : '已關閉'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {act.start_date || act.end_date ? `${act.start_date || '即日起'} ~ ${act.end_date || '無期限'}` : '不限時'}
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <div className="flex justify-center gap-3">
                  <button onClick={() => onEdit(act)} className="p-1 text-[#964696] hover:bg-[#964696]/10 rounded transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(act.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminActivityTable;