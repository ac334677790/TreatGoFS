import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('建議');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('用戶未登入');
      
      const { error } = await supabase
        .from('feedback')
        .insert([{
          user_id: user.id,
          message: message.trim(),
          category
        }]);
      
      if (error) throw error;
      
      setSuccess(true);
      setMessage('');
      
      // 3 秒後重置成功訊息
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交反饋失敗');
      console.error('提交反饋時發生錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-800 p-6 rounded-xl">      
      {success ? (
        <div className="bg-green-900/30 border border-green-500 p-4 rounded-lg text-center">
          <p className="text-green-300">反饋提交成功！</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block mb-2 text-2xl font-semibold text-amber-500">
              反饋類型
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-stone-700 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-500"
            >
              <option value="錯誤">錯誤</option>
              <option value="建議">建議</option>
              <option value="問題">問題</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-2xl font-semibold text-amber-500 mb-2">
              反饋內容
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="請輸入您的反饋內容..."
              rows={4}
              className="w-full px-4 py-2 bg-stone-700 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-500"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                提交中...
              </>
            ) : (
              '提交反饋'
            )}
          </button>
        </form>
      )}
    </div>
  );
}