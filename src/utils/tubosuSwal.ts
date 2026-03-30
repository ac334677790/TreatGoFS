// src/utils/tubosuSwal.ts

import Swal from 'sweetalert2'

interface TubosuSwalOptions {
  message: string;
  confirmText?: string;
  icon?: 'success' | 'error' | 'warning';
  showCancelButton?: boolean;
  cancelText?: string;
}

/**
 * 顯示 Tubosu 樣式的 Swal 彈窗
 */
export async function showTubosuSwal({
  message,
  confirmText = '確定',
  icon,
  showCancelButton = false,
  cancelText = '取消',
}: TubosuSwalOptions) {
  return await Swal.fire({
    width: 300,
    html: `
      <div class="tubosu-msg">
        <div class="tubosu-msg-text">${message}</div>
      </div>
    `,
    icon: icon || undefined,
    showConfirmButton: true,
    confirmButtonText: confirmText,
    showCancelButton: showCancelButton,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'tubosu-popup',
      confirmButton: 'tubosu-confirm-button',
      cancelButton: 'tubosu-cancel-button',
    },
    background: '',
  });
}
