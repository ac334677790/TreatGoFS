import { useEffect, useState } from "react";
import { InfoSidebar } from "../components/InfoSidebar";
import { SideNavigation } from "../components/SideNavigation";
import { supabase } from "../lib/supabase";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js"; // Ensure this import exists
import { getCurrentUserId, restoreGuestSession } from "../utils/auth";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [userStats, setUserStats] = useState<any>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);    
    const [user, setUser] = useState<User | null>(null);
    const [fadeOut, setFadeOut] = useState(false);
  
    useEffect(() => {
      restoreGuestSession
      console.log
      }, [navigate]);
      
      

    const handleLogout = async () => {
      setFadeOut(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/overview');
      }, 500);
    };
    
    useEffect(() => {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          navigate('/overview')
        } else {
          setLoading(false)
        }
      }
  
      checkSession()
    }, [navigate])
  

      
      
    useEffect(() => {
      const load = async () => {
        var user_id = await getCurrentUserId();
        const result = await supabase.rpc('get_user_summary', { p_user_id: user_id })
        if (result.error) {
          console.error('error:', result.error)
        } else {
          setUserStats(result.data?.[0])
        }
      }
      load()
    }, [])
    
    // if (loading) {
    //     return (
    //       <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white text-xl">
    //         載入中...
    //       </div>
    //     );
    //   }

    // Fetch user stats
    // useEffect(() => {
    //     async function fetchUserStats() {
    //         try {
    //             const { data: { user } } = await supabase.auth.getUser();
    //             if (user) {
    //                 const { data: statsData, error } = await supabase
    //                     .from('user_stats')
    //                     .select('*')
    //                     .eq('user_id', user.id)
    //                     .single();

    //                 if (error) throw error;

    //                 setUserStats(statsData);
    //             }
    //         } catch (err) {
    //             console.error('Error fetching user stats:', err);
    //         }
    //     }

    //     fetchUserStats();
    // }, []);
    return (
        <div className={`flex min-h-screen bg-stone-900 text-white transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {/* 左側選單 */}
            <SideNavigation userStats={userStats} />

            {/* 中間內容 */}
            <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto xl:ml-64 xl:mr-96 md:ml-0 md:max-w-full">
                {children}
            </div>

            {/* 右側資訊欄 */}
            <InfoSidebar userStats={userStats} user={user} />
        </div>
    );
}