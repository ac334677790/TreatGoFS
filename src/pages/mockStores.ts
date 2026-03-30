export interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  phone: string;
  offer_details: string;
  valid_start: string;
  valid_end: string;
  lat: number;
  lng: number;
  image_url?: string | null;
  distance?: number;
}

// 模擬多樣化的廠商資料，包含全台各地與不同類別
export const mockStores: Store[] = [
  {
    id: 1,
    name: "享樂咖啡信義店",
    category: "餐飲",
    address: "台北市信義區信義路五段7號",
    phone: "02-1234-5678",
    offer_details: "憑證全品項 9 折",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.032969,
    lng: 121.565418,
    image_url: "https://placehold.co/600x400?text=Coffee"
  },
  {
    id: 2,
    name: "全真瑜珈 (True Yoga)",
    category: "運動",
    address: "台北市忠孝東路四段",
    phone: "02-2700-0000",
    offer_details: "免入會費，體驗課免費",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.0416,
    lng: 121.5516,
    image_url: "https://placehold.co/600x400?text=Yoga"
  },
  {
    id: 3,
    name: "新竹喜來登飯店",
    category: "住宿",
    address: "新竹縣竹北市光明六路東一段265號",
    phone: "03-620-6000",
    offer_details: "平日住宿 45 折",
    valid_start: "2026/01/01",
    valid_end: "2026/06/30",
    lat: 24.827,
    lng: 121.025,
    image_url: "https://placehold.co/600x400?text=Sheraton"
  },
  {
    id: 4,
    name: "王品牛排 (台北羅斯福店)",
    category: "餐飲",
    address: "台北市中正區羅斯福路二段",
    phone: "02-2393-4689",
    offer_details: "消費套餐享 95 折優惠",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.0274,
    lng: 121.5226,
    image_url: null
  },
  {
    id: 5,
    name: "墾丁凱撒大飯店",
    category: "住宿",
    address: "屏東縣恆春鎮墾丁路6號",
    phone: "08-886-1888",
    offer_details: "淡季平日升等房型",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 21.9405,
    lng: 120.7963,
    image_url: "https://placehold.co/600x400?text=Kenting"
  },
  {
    id: 6,
    name: "World Gym (板橋雙十店)",
    category: "運動",
    address: "新北市板橋區雙十路二段",
    phone: "02-2255-0000",
    offer_details: "首次體驗免費，入會費 0 元",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.0298,
    lng: 121.4725,
    image_url: null
  },
  {
    id: 7,
    name: "秀泰影城 (台中站前)",
    category: "娛樂",
    address: "台中市東區南京路76號",
    phone: "04-2211-7988",
    offer_details: "電影票早場優惠價",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 24.1417,
    lng: 120.6882,
    image_url: "https://placehold.co/600x400?text=Cinema"
  },
  {
    id: 8,
    name: "大學眼科診所",
    category: "醫療",
    address: "台北市中正區公園路",
    phone: "02-2382-0658",
    offer_details: "掛號費減免 50 元",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.0441,
    lng: 121.5173,
    image_url: null
  },
  {
    id: 9,
    name: "宜蘭蘭城晶英酒店",
    category: "住宿",
    address: "宜蘭縣宜蘭市民權路二段36號",
    phone: "03-935-1000",
    offer_details: "櫻桃鴨套餐預訂 9 折",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 24.7561,
    lng: 121.7516,
    image_url: "https://placehold.co/600x400?text=Hotel"
  },
  {
    id: 10,
    name: "漢神巨蛋購物廣場",
    category: "購物",
    address: "高雄市左營區博愛二路777號",
    phone: "07-555-9688",
    offer_details: "特約商店停車免費 2 小時",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 22.6696,
    lng: 120.3022,
    image_url: "https://placehold.co/600x400?text=Mall"
  },
  {
    id: 11,
    name: "家樂福 (內湖店)",
    category: "購物",
    address: "台北市內湖區民善街88號",
    phone: "02-2790-5050",
    offer_details: "特定商品滿千送百",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.0607,
    lng: 121.5746,
    image_url: null
  },
  {
    id: 12,
    name: "花蓮遠雄海洋公園",
    category: "娛樂",
    address: "花蓮縣壽豐鄉福德189號",
    phone: "03-812-3199",
    offer_details: "門票 8 折優惠",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 23.9037,
    lng: 121.6062,
    image_url: "https://placehold.co/600x400?text=OceanPark"
  },
  {
    id: 13,
    name: "藏壽司 (松江南京店)",
    category: "餐飲",
    address: "台北市中山區南京東路二段",
    phone: "02-2562-1234",
    offer_details: "平日用餐送扭蛋機會",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.0519,
    lng: 121.5332,
    image_url: null
  },
  {
    id: 14,
    name: "台南奇美博物館",
    category: "藝文",
    address: "台南市仁德區文華路二段66號",
    phone: "06-266-0808",
    offer_details: "常設展門票團體票價",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 22.9346,
    lng: 120.2260,
    image_url: "https://placehold.co/600x400?text=Museum"
  },
  {
    id: 15,
    name: "Gogoro 維修中心 (中和店)",
    category: "行車交通",
    address: "新北市中和區中正路",
    phone: "02-2222-3333",
    offer_details: "定期保養工資 9 折",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 24.9965,
    lng: 121.4947,
    image_url: null
  },
  {
    id: 16,
    name: "日月潭雲品溫泉酒店",
    category: "住宿",
    address: "南投縣魚池鄉中正路23號",
    phone: "049-285-6788",
    offer_details: "一泊二食專案優惠價",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 23.8711,
    lng: 120.9248,
    image_url: "https://placehold.co/600x400?text=Lake"
  },
  {
    id: 17,
    name: "好市多 Costco (北投店)",
    category: "購物",
    address: "台北市北投區立德路117號",
    phone: "449-9909",
    offer_details: "會員卡辦理優惠",
    valid_start: "2026/01/01",
    valid_end: "2026/12/31",
    lat: 25.1278,
    lng: 121.4678,
    image_url: null
  }
];