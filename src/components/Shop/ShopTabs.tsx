import React from 'react';

export function ShopTabs({
  selectedTab,
  onChangeTab
}: {
  selectedTab: 'superNuts' | 'subscriptions';
  onChangeTab: (tab: 'superNuts' | 'subscriptions') => void;
}) {
  return (
    <nav className="flex border-b border-stone-700 mb-6">
      {['superNuts', 'subscriptions'].map((tab) => (
        <button
          key={tab}
          onClick={() => onChangeTab(tab as 'superNuts' | 'subscriptions')}
          className={`py-2 px-4 font-medium ${
            selectedTab === tab
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-stone-400 hover:text-stone-300'
          }`}
        >
          {tab === 'superNuts' ? '超級堅果' : '訂閱'}
        </button>
      ))}
    </nav>
  );
}