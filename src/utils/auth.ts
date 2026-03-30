import { supabase } from "../lib/supabase";


// 儲存訪客 UID
function saveGuestUid(uid: string) {
  localStorage.setItem('guest_uid', uid);
}

// 讀取訪客 UID
function getGuestUid() {
  return localStorage.getItem('guest_uid');
}

// 清除訪客 UID
export function clearGuestUid() {
  localStorage.removeItem('guest_uid');
}

// 匿名登入流程
export async function signInAsGuest() {
  const existingGuestUid = getGuestUid();

  if (existingGuestUid) {
    // 嘗試使用現有匿名帳號登入
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${existingGuestUid}@guest.example.com`,
      password: existingGuestUid,
    });

    if (!error) {
      console.log('匿名帳號自動恢復成功');
      return data.user;
    } else {
      console.warn('匿名帳號恢復失敗，重新建立匿名帳號');
      clearGuestUid();
    }
  }

  // 建立新的匿名帳號
  const guestEmail = `${Date.now()}-${Math.random()}@guest.example.com`;
  const guestPassword = crypto.randomUUID();

  const { data, error } = await supabase.auth.signUp({
    email: guestEmail,
    password: guestPassword,
  });

  if (error) {
    console.error('匿名登入失敗:', error.message);
    throw new Error(error.message);
  }

  if (data.user) {
    saveGuestUid(data.user.id);
    console.log('新匿名帳號建立成功');
    return data.user;
  }

  return null;
}

// 啟動時恢復匿名 session
export async function restoreGuestSession() {
  const guestUid = getGuestUid();

  if (!guestUid) {
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    try {
      await supabase.auth.signInWithPassword({
        email: `${guestUid}@guest.example.com`,
        password: guestUid,
      });
      console.log('匿名帳號自動恢復完成');
    } catch (error) {
      console.warn('恢復匿名帳號失敗，將清除 localStorage');
      clearGuestUid();
    }
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('無法取得使用者資料', error?.message);
    return null;
  }
  return user.id;
}
