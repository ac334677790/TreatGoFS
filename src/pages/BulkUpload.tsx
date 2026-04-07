import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, FileUp, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const BulkUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const navigate = useNavigate();

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        '廠商名稱': '享樂咖啡信義店',
        '分類': '餐飲',
        '地址': '台北市信義區信義路五段7號',
        '電話': '02-1234-5678',
        '優惠內容': '憑證全品項 9 折',
        '特約起始日期': '2026/01/01',
        '特約結束日期': '2026/12/31',
        '緯度': 25.032969,
        '經度': 121.565418
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "範例資料");
    XLSX.writeFile(workbook, "特約廠商上傳範例.xlsx");
  };

  // 輔助函式：延遲執行（避免 API 頻率限制）
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // 輔助函式：強效比對欄位名稱（忽略空格、換行與大小寫）
  const getVal = (item: any, possibleKeys: string[]) => {
    const keys = Object.keys(item);
    const foundKey = keys.find(k => 
      possibleKeys.some(p => 
        k.trim().replace(/\s/g, '').toLowerCase() === p.replace(/\s/g, '').toLowerCase()
      )
    );
    return foundKey ? item[foundKey] : undefined;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0 });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws) as any[];
        
        setProgress({ current: 0, total: rawData.length });
        const formattedData = [];

        for (let i = 0; i < rawData.length; i++) {
          const item = rawData[i];
          const name = getVal(item, ['廠商名稱', 'name']);
          if (!name) continue; // 跳過沒有名稱的列

          const address = String(getVal(item, ['地址', 'address']) || '');
          const excelLat = getVal(item, ['緯度', 'lat']);
          const excelLng = getVal(item, ['經度', 'lng']);
          
          let lat = excelLat ? parseFloat(excelLat) : 0;
          let lng = excelLng ? parseFloat(excelLng) : 0;
          
          if (isNaN(lat)) lat = 0;
          if (isNaN(lng)) lng = 0;

          // 如果 Excel 沒提供經緯度 (0)，則進行自動地址對照
          if ((lat === 0 || lng === 0) && address) {
            if (i > 0) await sleep(1000); 
            const coords = await getCoordinates(address);
            lat = coords.lat;
            lng = coords.lng;
          }

          formattedData.push({
            name: String(name).trim(),
            category: String(getVal(item, ['分類', 'category']) || '其他'),
            address: address,
            phone: String(getVal(item, ['電話', 'phone']) || ''),
            offer_details: String(getVal(item, ['優惠內容', 'offer_details']) || ''),
            valid_start: String(getVal(item, ['特約起始日期', 'valid_start']) || ''),
            valid_end: String(getVal(item, ['特約結束日期', 'valid_end']) || ''),
            lat: lat,
            lng: lng
          });

          setProgress(prev => ({ ...prev, current: i + 1 }));
        }

        // 批次寫入 Supabase (使用 upsert 避免重複)
        const { error: dbError } = await supabase
          .from('contract_stores')
          .upsert(formattedData, { onConflict: 'name' });

        if (dbError) throw dbError;

        setResult({ success: formattedData.length, failed: 0 });
      } catch (err: any) {
        setError(err.message || '檔案解析或上傳失敗');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin" className="text-[#964696] flex items-center gap-1 mb-6 hover:underline font-medium">
          <ArrowLeft size={16} /> 返回管理後台
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-[#545454] mb-2">批次上傳廠商資料</h1>
          <p className="text-slate-500 mb-4">請上傳包含正確欄位名稱的 Excel 檔案。若不確定格式，請先下載範例檔參考。</p>
          
          <button 
            onClick={downloadSampleExcel}
            className="flex items-center gap-2 text-sm text-[#009BAA] hover:opacity-80 transition-colors mb-8 font-medium border border-[#009BAA]/20 px-3 py-1.5 rounded-lg bg-[#009BAA]/5"
          >
            <Download size={16} /> 下載範例 Excel
          </button>

          {!result ? (
            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'bg-slate-50 border-slate-300' : 'hover:bg-[#009BAA]/10 border-[#009BAA]/20 bg-[#009BAA]/5'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className={`w-12 h-12 mb-4 ${uploading ? 'text-slate-400 animate-bounce' : 'text-[#009BAA]'}`} />
                <p className="mb-2 text-sm text-slate-700">
                  <span className="font-semibold">{uploading ? `正在處理 (${progress.current}/${progress.total})...` : '點擊上傳'}</span> 或拖放檔案
                </p>
                {uploading && (
                  <div className="w-48 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#009BAA] h-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                  </div>
                )}
                <p className="text-xs text-slate-500">支援 XLSX, CSV 格式</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={uploading} />
            </label>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">上傳成功！</h2>
              <p className="text-slate-600 mb-6">已成功匯入 {result.success} 筆資料。</p>
              <button 
                onClick={() => navigate('/admin')}
                className="bg-[#964696] text-white px-8 py-2 rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                查看結果
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold">發生錯誤</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;