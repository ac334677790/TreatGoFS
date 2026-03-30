import React from 'react';
import { Lock, Unlock } from 'lucide-react';

type VocabularyCardProps = {
  word: string;
  definition: string; // 單個字符串，內部拆分為陣列
  partOfSpeech: string; // 單個字符串，內部拆分為陣列
  accuracy: number | null; // 正確率，null 表示未出現過
  isMainWord: boolean;
  onClick?: () => void;
};

export function VocabularyCard({
  word,
  definition,
  partOfSpeech,
  accuracy,
  isMainWord,
  onClick,
}: VocabularyCardProps) {
  // 將傳入的字符串拆分為陣列
  const definitionArray = definition.split(',').map((item) => item.trim());
  const partOfSpeechArray = partOfSpeech.split(',').map((item) => item.trim());

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-colors bg-stone-700/50 hover:bg-stone-700 ${
        isMainWord && 0 ? 'border-2 border-amber-500' : ''
      }`}
      onClick={onClick}
    >
      {/* 單字部分 */}
      <div className="flex justify-center items-center">
        <div>
          {accuracy !== null && (
            <span className="font-medium text-amber-500">{word || '???'}</span>
          )}
          {accuracy === null && (
            <span className="font-medium text-amber-500">{'???'}</span>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end border-b border-stone-600 pb-2 mb-2">
        <div>
          {accuracy !== null && (
            <p className="text-sm text-stone-400 mt-1">{accuracy}%</p>
          )}
          {accuracy === null && (
            <p className="text-sm text-stone-400 mt-1">??%</p>
          )}
        </div>
      </div>
      {/* 說明部分 */}
      {accuracy !== null && (
      <div className="space-y-2">
        {definitionArray.map((def, index) => (
          <div key={index} className="grid grid-cols-10 items-center">
            {/* 詞性 */}
            <div className="col-span-3 text-center text-amber-400 tracking-wide pr-2">
              <span className="px-1 py-0.5 bg-stone-600 rounded">
                [{partOfSpeechArray[index] || '?'}]
              </span>
            </div>
            {/* 定義 */}
            <div className="col-span-7 text-left text-amber-400">{def}</div>
          </div>
        ))}
      </div>
          )}
    </div>
  );
}