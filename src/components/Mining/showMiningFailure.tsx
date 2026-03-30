import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function showMiningFailure({
  title,
  message,
  icon = '/assets/failure-icon.png', // 預設失敗圖標
  confirmText = '返回地圖',
}: {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
}) {
  MySwal.fire({
    html: `
      <div class="tubosu-msg">
        <div class="tubosu-msg-text">${message}</div>
      </div>
      
    `,
    imageUrl: '/images/mining_fail2.png', // 圖片本身可加
    showConfirmButton: true,
    confirmButtonText: `<span style="display: flex; align-items: center; justify-content: center; gap: 8px;" class="text-amber-900">
      ${confirmText}
    </span>`,
    confirmButtonColor: '#f59e0b', // 使用紅色系
    customClass: {
      popup: 'tubosu-popup',
    },
    width: '350px',
    backdrop: false, // 背景遮罩
  }).then(() => {
    window.location.href = '/map'; // 返回地圖頁面
  });
}