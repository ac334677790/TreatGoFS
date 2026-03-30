import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function showMiningResult({
  title,
  currentLevel,
  rewards,
  experienceArray,  // 新增經驗值陣列
  currentTotalExperience, // 當前累計經驗
  gainedExperience, // 新增獲得的經驗值
}: {
  title: string;
  currentLevel: number;
  rewards: { icon: string; name: string; amount: number }[];
  experienceArray: number[]; // 等級經驗需求陣列
  currentTotalExperience: number;  // 當前累計經驗
  gainedExperience: number; // 本次獲得的經驗值
}) {
  const audio = new Audio('/assets/level-up.mp3');
  let currentExperience = currentTotalExperience - experienceArray[currentLevel - 1]; // 之前經驗值
  let nextExperience = currentExperience + gainedExperience; // 當前經驗值
  let upExperience = experienceArray[currentLevel] - experienceArray[currentLevel-1]; // 升級所需經驗值
  let progressBefore = currentExperience / upExperience * 100; // 當前進度條的百分比
  let progressAfter = Math.min(nextExperience / upExperience * 100,100); // 升級後的進度條百分比
  console.log('experienceArray', experienceArray);

//<img id="spark" src="/assets/spark.gif" style="position: absolute; top: -20px; left: -20px; width: 120px; height: 120px; display: none;" />
  MySwal.fire({
    html: `
    <div class="tubosu-msg-text">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="position: absolute; top: -10px; left: 50%; transform: translate(-50%, -50%);">
          <img src="/images/mine.png" style="width: 120px; height: 120px;" />
          
        </div>
        <div id="level-text" style="margin-top: 20px; font-size: 30px; font-weight: bold;">${title} Lv.${currentLevel}</div>
        <div style="margin-top: 25px; width: 100%; max-width: 300px;">
          <div style="background: #eee; border-radius: 10px; overflow: hidden;">
            <div id="progress-bar" style="height: 16px; width: ${progressBefore}%; background: #4caf50; transition: width 1s;"></div>
          </div>
        </div>
      </div>
      <div style="margin-top: 28px; font-size: 16px;">
        <div style=" font-size: 22px; font-weight: bold;">本次收獲：</div>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;overflow: hidden;">
          ${rewards
            .map(
              (item) => `
                <div style="margin: 6px; text-align: center; animation: fadeInUp 0.6s;">
                  <img src="${item.icon}" style="width: 80px; height: 80px;" />
                  <div style="font-weight: bold;">${item.name} x${item.amount}</div>
                </div>`
            )
            .join('')}
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: '<span style="display: flex; align-items: center; justify-content: center; gap: 8px;" class="text-amber-900">返回地圖</span>',
    confirmButtonColor: '#f59e0b', // 使用 amber 色系
    customClass: {
      popup: 'tubosu-popup',
    },
    width: '350px',
    backdrop: false,  // 禁用點擊背景關閉對話框
    willOpen: () => {
      const levelText = document.getElementById('level-text')!;
     
      const interval = setInterval(() => {
        if (nextExperience >= upExperience) {
          // 升級
          currentLevel++;
          levelText.innerText = `${title} Lv.${currentLevel}`;

          // 添加平滑過渡效果
          levelText.style.transition = 'transform 0.3s ease, color 0.3s ease';

          // 讓文字縮放並改變顏色
          levelText.style.transform = 'scale(1.4)';
          levelText.style.color = '#f39c12';

          // 動畫結束後恢復
          setTimeout(() => {
            levelText.style.transform = 'scale(1)';
            levelText.style.color = '#000';
          }, 300);

          nextExperience = currentTotalExperience + gainedExperience - experienceArray[currentLevel - 1]; // 當前經驗值
          upExperience = experienceArray[currentLevel] - experienceArray[currentLevel-1]; // 升級所需經驗值
          progressBefore = nextExperience / upExperience * 100; // 當前進度條的百分比
          progressAfter = Math.min(nextExperience / upExperience * 100,100); // 升級後的進度條百分比    
          const bar = document.getElementById('progress-bar')!; 
          console.log('transition1', bar.style.transition);
          bar.style.transition = 'none'; // 移除過渡動畫
          bar.style.width = '0%'; // 直接將進度條設置為 0%
          console.log('transition2', bar.style.transition);
          setTimeout(() => {
            const bar = document.getElementById('progress-bar')!;
            bar.style.transition = 'width 1s'; // 移除過渡動畫
            bar.style.width = `${progressAfter}%`;
          }, 400);

          // 如果升級達到目標等級，停止
          if (nextExperience < upExperience) {
            clearInterval(interval);
          }
        }
      }, 1200);


      // 延遲進度條變化
      setTimeout(() => {
        const bar = document.getElementById('progress-bar')!;
        bar.style.width = `${progressAfter}%`;
      }, 400);
    },
  }).then(() => {
    window.location.href = '/map'; // 改為你自己的導航方式
  });
}