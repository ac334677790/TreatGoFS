import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLoginSuccess?: (user: any) => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      if (error) throw error;
      if (data.user) {
        onLoginSuccess?.(data.user);
        navigate('/management/index');
      }
    } catch (error: any) {
      alert('登入失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#964696]/10 p-3 rounded-full mb-4">
            <Lock className="text-[#964696]" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#545454]">後台系統登入</h1>
          <p className="text-slate-400 text-sm mt-1">請輸入管理員帳號密碼</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">電子郵件</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#964696] outline-none transition-all"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#964696] text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <LogIn size={20} /> {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;