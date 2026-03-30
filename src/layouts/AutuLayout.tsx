import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { EmptyLayout } from './EmptyLayout';
import { supabase } from '../lib/supabase';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null 代表還在載入中

  const navigate = useNavigate();
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session);
    }

    checkSession()
  }, [navigate])
  const Layout = isLoggedIn ? MainLayout : EmptyLayout;


  return <Layout>{children}</Layout>;
}
