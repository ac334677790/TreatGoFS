import React from 'react';
import { useEffect, useRef, useState } from 'react';

// 對話框組件
export function TopoSpeechBubble({ text, show,isMobile }: { text: string; show: boolean; isMobile: boolean }) {
  const displayedText = useTypewriter(text);
  return (
    show && (
      !isMobile ? (
        <div className="absolute -top-12 left-16 animate-fadeIn pointer-events-none">
          <div className="bg-amber-100 text-brown-700 rounded-2xl px-4 py-2 text-sm relative shadow-sm border border-amber-300">
            {displayedText}
            {/* 對話框尾巴 */}
            <div className="absolute left-4 w-3 h-3 bg-amber-100 rotate-45 border-b border-amber-300" style={{ bottom: '-0.4rem' }}></div>
          </div>
        </div>
      ) : (
        <div className="absolute -top-6 left-8 animate-fadeIn pointer-events-none">
          <div className="bg-amber-100 text-brown-700 rounded-2xl px-2 py-1 text-xs relative shadow-sm border border-amber-300">
            {displayedText}
            {/* 對話框尾巴 */}
            <div className="absolute left-4 w-3 h-3 bg-amber-100 rotate-45 border-b border-amber-300" style={{ bottom: '-0.4rem' }}></div>
          </div>
        </div>
      )
    )
  );
}
// 打字效果 hook
function useTypewriter(text: string, speed = 100) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let index = 0;
    const safeText = text ?? '';
    setDisplayedText('');
    const interval = setInterval(() => {
      index++;
      setDisplayedText(safeText.slice(0, index));
      if (index >= safeText.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayedText;
}

function safeChar(text: string, index: number): string {
  return text?.[index] ?? '';
}