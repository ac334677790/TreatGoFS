import React from 'react';
import { Check } from 'lucide-react';

export function PaymentModal({
  selectedPackage,
  selectedTab,
  loading,
  paymentSuccess,
  onClose,
  onSubmit
}: {
  selectedPackage: any;
  selectedTab: 'superNuts' | 'subscriptions';
  loading: boolean;
  paymentSuccess: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 rounded-xl p-6 max-w-md w-full">
        {paymentSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-500 mb-2">付款成功</h3>
            <p className="text-stone-300 mb-4">
              {selectedTab === 'superNuts' ? `已新增 ${selectedPackage.amount} 超級堅果` : `已新增 ${selectedPackage.amount} 方閱`}
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-amber-500 mb-4">付款資訊</h3>
            <div className="bg-stone-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-stone-400">商品：</span>
                <span>{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-stone-400">數量：</span>
                <span>{selectedPackage.amount}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-stone-400">總計：</span>
                <span>NT$ {selectedPackage.price}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded-lg text-stone-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                確認付款
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}