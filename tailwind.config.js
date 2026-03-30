/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./pay.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    safelist: [
      'from-yellow-200',
      'to-yellow-500',
      'from-orange-200',
      'to-orange-500',
      'from-pink-200',
      'to-pink-500',
      'from-purple-200',
      'to-purple-500',
      'from-red-200',
      'to-red-500',
    ],    
    extend: {
      colors: {
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        brown: {
          50: '#f8f1e8', // 很淡的米棕色，適合背景或 hover
          100: '#ecd9c6', // 淺咖啡色
          200: '#d9b899', // 柔和淺棕色
          300: '#c69c7a', // 中間暖棕色（建議文字背景）
          400: '#b57d57', // 飽和棕色
          500: '#a16242', // 主體棕色（文字顏色）
          600: '#854e34', // 深一點，邊框、重點文字
          700: '#6b3f2a', // 深棕，強調
          800: '#523021', // 很深棕，重點邊框或文字
          900: '#3a2118', // 最深，陰影或強烈對比
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        shake1: 'shake1 0.3s ease-in-out',
        shake2: 'shake2 0.5s ease-in-out',
        shake3: 'shake3 0.5s ease-in-out',
        shake4: 'shake4 0.5s ease-in-out',
        shake5: 'shake5 0.5s ease-in-out',  
        dig: 'dig 0.3s ease-in-out',
        burst: 'burst 0.5s ease-out',
        fall: 'fall 0.8s ease-in forwards',
        comboShake: 'comboShake 0.6s infinite ease-out',
        comboShakeStrong: 'comboShake 0.6s infinite ease-out',
        comboLevelUp: 'comboLevelUp 0.4s ease-out',
        goldFlow: 'goldFlow 3s linear infinite',
        goldShine: 'goldShine 1.2s ease-in-out infinite',
        pixageBroken: 'comboLevelUp 0.3s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(5px)' }, // 往下敲擊
          '60%': { transform: 'translateY(-2px)' }, // 回彈效果
        },
        shake1: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
              '30%': { transform: 'translateY(5px) scale(0.95)' },
              '60%': { transform: 'translateY(-2px) scale(1.02)' },
        },
        shake2: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-15px)' },
          '75%': { transform: 'translateX(15px)' },
        },
        shake3: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-20px)' },
          '75%': { transform: 'translateX(20px)' },
        },
        shake4: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-25px)' },
          '75%': { transform: 'translateX(25px)' },
        },
        shake5: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-30px)' },
          '75%': { transform: 'translateX(30px)' },
        },
        dig: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(8px) scale(0.95)' },
          '60%': { transform: 'translateY(-4px) scale(1.02)' },
        },
        burst: {
          '0%': { opacity: '1', transform: 'scale(0.5) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(1.5) translateY(-20px)' },
        },
        fall: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(60px)' },
        },
        comboShake: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '10%': { transform: 'translate(-2px, -2px) rotate(-1deg)' },
          '20%': { transform: 'translate(2px, 2px) rotate(1deg)' },
          '30%': { transform: 'translate(-3px, 1px) rotate(-1deg)' },
          '40%': { transform: 'translate(3px, -2px) rotate(1deg)' },
          '50%': { transform: 'translate(-1px, 3px) rotate(0deg)' },
          '60%': { transform: 'translate(2px, -3px) rotate(1deg)' },
          '70%': { transform: 'translate(-2px, 2px) rotate(-1deg)' },
          '80%': { transform: 'translate(3px, 0px) rotate(0deg)' },
          '90%': { transform: 'translate(-3px, 1px) rotate(1deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        comboShakeStrong: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '10%': { transform: 'translate(-4px, -4px) rotate(-2deg)' },
          '20%': { transform: 'translate(4px, 4px) rotate(2deg)' },
          '30%': { transform: 'translate(-6px, 2px) rotate(-3deg)' },
          '40%': { transform: 'translate(6px, -4px) rotate(3deg)' },
          '50%': { transform: 'translate(-3px, 6px) rotate(-2deg)' },
          '60%': { transform: 'translate(4px, -6px) rotate(2deg)' },
          '70%': { transform: 'translate(-4px, 4px) rotate(-3deg)' },
          '80%': { transform: 'translate(6px, 0px) rotate(2deg)' },
          '90%': { transform: 'translate(-6px, 2px) rotate(-2deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },        
        comboLevelUp: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.5)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        goldFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        goldShine: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.8)' },
        },
      },
    },
  },
  plugins: [],
};

