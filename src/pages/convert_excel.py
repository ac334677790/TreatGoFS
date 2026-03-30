import pandas as pd
import json
import os
import sys

def convert_excel_to_ts(file_path, output_path):
    if not os.path.exists(file_path):
        print(f"Error: Excel file not found at {file_path}")
        return

    # 讀取 Excel (使用 openpyxl 引擎處理 .xlsx)
    df = pd.read_excel(file_path, engine='openpyxl')

    # 清洗欄位名稱 (移除空格)
    df.columns = [str(c).strip() for c in df.columns]

    # 欄位映射：Excel 標題 -> TypeScript 介面欄位
    # 如果您的 Excel 標題不同，請修改下方的 Key 值
    mapping = {
        '廠商名稱': 'name',
        '分類': 'category',
        '地址': 'address',
        '電話': 'phone',
        '優惠內容': 'offer_details',
        '特約起始日期': 'valid_start',
        '特約結束日期': 'valid_end',
        '緯度': 'lat',
        '經度': 'lng'
    }

    # 重新命名並移除不必要的欄位
    df = df.rename(columns=mapping)
    cols_to_keep = [v for v in mapping.values() if v in df.columns]
    df = df[cols_to_keep]

    # 轉換為列表並清理資料型別
    raw_records = df.to_dict(orient='records')
    processed_records = []

    for i, record in enumerate(raw_records):
        # 確保經緯度為 float 格式，缺失值補 0.0
        processed_records.append({
            "id": i + 1,
            "name": str(record.get('name', '未命名廠商')),
            "category": str(record.get('category', '其他')),
            "address": str(record.get('address', '')),
            "phone": str(record.get('phone', '')),
            "offer_details": str(record.get('offer_details', '')),
            "valid_start": str(record.get('valid_start', '')),
            "valid_end": str(record.get('valid_end', '')),
            "lat": float(record.get('lat', 0)) if pd.notnull(record.get('lat')) else 0.0,
            "lng": float(record.get('lng', 0)) if pd.notnull(record.get('lng')) else 0.0,
            "image_url": None
        })

    # 組合 TypeScript 檔案內容
    ts_content = "export interface Store {\n  id: number;\n  name: string;\n  category: string;\n  address: string;\n  phone: string;\n  offer_details: string;\n  valid_start: string;\n  valid_end: string;\n  lat: number;\n  lng: number;\n  image_url?: string | null;\n  distance?: number;\n}\n\n"
    ts_content += "export const mockStores: Store[] = " + json.dumps(processed_records, indent=2, ensure_ascii=False) + ";"

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"成功轉換 {len(processed_records)} 筆資料至 {output_path}")

if __name__ == "__main__":
    # 設定路徑（以腳本位置為基準）
    script_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = os.path.join(script_dir, "2026特約最新檔377家.xlsx")
    output_path = os.path.join(script_dir, "..", "src", "pages", "mockStores.ts")
    convert_excel_to_ts(excel_path, output_path)