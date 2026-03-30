// 模擬 377 家廠商的 JSON 資料
// 欄位對應未來 Supabase table: 'contract_stores'
export const mockStores = [
  {
    id: 1, // bigint or uuid
    name: "享樂咖啡信義店", // text
    category: "餐飲", // text
    address: "台北市信義區信義路五段7號", // text
    phone: "02-1234-5678", // text
    offer_details: "憑證全品項 9 折", // text (優惠內容)
    lat: 25.032969, // float8 (未來可改用 geometry)
    lng: 121.565418, // float8
    image_url: "https://placehold.co/600x400?text=Coffee" // text (選填，圖片連結)
  },
  {
    id: 2,
    name: "全真瑜珈 (True Yoga)",
    category: "休閒娛樂",
    address: "台北市忠孝東路四段",
    phone: "02-2700-0000",
    offer_details: "免入會費，體驗課免費",
    lat: 25.0416,
    lng: 121.5516,
    image_url: null
  },
  {
    id: 3,
    name: "新竹喜來登飯店",
    category: "住宿",
    address: "新竹縣竹北市光明六路東一段265號",
    phone: "03-620-6000",
    offer_details: "平日住宿 45 折",
    lat: 24.827,
    lng: 121.025,
    image_url: null
  },
  // ... 這裡可以繼續填入您的 377 筆資料
];
