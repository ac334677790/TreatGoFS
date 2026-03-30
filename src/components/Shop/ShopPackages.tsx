import React from 'react';

export function ShopPackages({
  type,
  packages,
  onPurchase
}: {
  type: string;
  packages: any[];
  onPurchase: (pkg: any) => void;
}) {
  
if(type === 'superNuts') {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div key={pkg.id} className="relative bg-amber-300 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          {/* 折扣標籤 */}
          {pkg.discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
              -{pkg.discount}%
            </div>
          )}

          {/* 商品內容 */}
          <div className="p-4">
            {/* 標題 */}
            <h3 className="text-2xl font-bold text-amber-700 mb-2 text-center">{pkg.name}</h3>

            {/* 商品圖片 */}
            <div className="flex justify-center mb-4">
              <img
                src={pkg.image || '/images/default.png'}
                alt={pkg.name}
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* 商品描述 */}
            <p className="text-amber-700 text-xl font-bold mb-2 text-center">
              {pkg.description}
            </p>

            {/* 價格 */}
            <div className="text-2xl font-bold text-amber-700 mb-4 text-center">NT$ {pkg.price}</div>

            {/* 購買按鈕 */}
            <button
              onClick={() => onPurchase(pkg)}
              className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors"
            >
              購買
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
if (type === 'subscriptions') {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <div key={pkg.id} className="relative bg-orange-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          {/* 最受歡迎標籤 */}
          {pkg.highlight && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-amber-700 text-xs px-2 py-1 rounded-full">
              最受歡迎
            </div>
          )}

          {/* 商品內容 */}
          <div className="p-4 mt-2">
            {/* 標題 */}
            <h3 className="text-2xl font-bold text-orange-700 mb-2 text-center">{pkg.name}</h3>

            {/* 商品圖片 */}
            <div className="flex justify-center mb-4">
              <img
                src={pkg.image || '/images/subscription_default.png'}
                alt={pkg.name}
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* 商品描述（訂閱 perks）*/}
            <ul className="text-orange-700 text-lg font-bold mb-4 space-y-1 min-h-[120px] overflow-y-auto">

              {pkg.perks.map((perk: string, index: number) => (
                <li key={index}>✅ {perk}</li>
              ))}
            </ul>

            {/* 價格 */}
            <div className="text-2xl font-bold text-orange-700 mb-4 text-center">
              NT$ {pkg.price} / 月
            </div>

            {/* 訂閱按鈕 */}
            <button
              onClick={() => onPurchase(pkg)}
              className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-colors"
            >
              立即訂閱
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

}