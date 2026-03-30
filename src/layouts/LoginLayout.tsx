import { Link, useNavigate } from 'react-router-dom';
import { Logo } from "../components/Logo";

export function LoginLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-stone-900 text-white relative overflow-hidden">
      {/* Header */}
      <header className="bg-stone-800 text-white py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>

          {/* 導覽列 */}
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-amber-500 hover:text-yellow-400 transition">返回首頁</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-400 py-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
          <div className="text-sm space-y-1 text-center md:text-left">
            <p>© 2025 Tubosu. 保留所有權利.</p>
            <p>土撥鼠科技工作室｜統一編號：00409761</p>
          </div>

          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-white transition">使用條款</Link>
            <Link to="/privacy" className="hover:text-white transition">隱私政策</Link>
            <Link to="/contact" className="hover:text-white transition">聯絡我們</Link>
            <Link to="/refund-policy" className="hover:text-white transition">退款政策</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}