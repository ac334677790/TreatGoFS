import { useEffect, useState } from "react";
import { InfoSidebar } from "../components/InfoSidebar";
import { SideNavigation } from "../components/SideNavigation";
import { supabase } from "../lib/supabase";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js"; // Ensure this import exists
import { restoreGuestSession } from "../utils/auth";

export function MainEmptyLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
  
    useEffect(() => {
      restoreGuestSession
      }, [navigate]);
      
    
    return <div className="min-h-screen bg-stone-900 text-white">{children}</div>;

}