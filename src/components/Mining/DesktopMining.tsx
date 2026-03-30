import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { CoinIcon } from '../CoinIcon';
import { PickaxeDurability } from './PickaxeDurability';
import { RewardProgress } from './RewardProgress';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import MineralLayer1 from '/images/MineralLayey1.png';
import ore1 from '/images/ore1.png';
import tubo from '/images/tubo.png';
import { TopoSpeechBubble } from './TopoSpeechBubble';
import { ToastContainer, toast } from 'react-toastify';  // 引入 react-toastify
import { getCurrentUserId } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import { showMiningResult } from './ShowMiningResult';
import { showMiningFailure } from './showMiningFailure';
import { use } from 'i18next';

type VocabularyWord = {
  id: string;
  word: string;
  chinese: string;
  syllables: string;
  phonetic?: string;
  part_of_speech?: string;
  definition: string;
  part_of_speech2?: string;
  definition2: string;
  part_of_speech3?: string;
  definition3: string;
};

const MIN_COMBO_INTERVAL = 1200; // 毫秒內重複敲擊判定為 combo

export function DesktopMining() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { chapter_id, section_id,progressSession } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [pickaxeDurability, setPickaxeDurability] = useState(3);
  const [userStats, setUserStats] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [mineLevels, setMineLevels] = useState<number[]>([]);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [dailyGoal] = useState(20);
  const [rewardsClaimed, setRewardsClaimed] = useState({ half: false, full: false });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [comboCount, setComboCount] = useState(0);
  const [animationClass, setAnimationClass] = useState('');
  const [particleKey, setParticleKey] = useState(0);
  const [drops, setDrops] = useState([]); // 掉落金幣/礦石動畫
  const [combo, setCombo] = useState(0);
  const [answeredWords, setAnsweredWords] = useState<string[]>([]);  // 答對的單字
  const [wrongWords, setWrongWords] = useState<string[]>([]);  // 答錯的單字
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [userId, setUserId] = useState<any[]>([]);
  

  const lastClickRef = useRef<number | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const correctAudio = new Audio('/sounds/hit-rock-01.mp3');
  const wrongAudio = new Audio('/sounds/metal_wrong.mp3');


  // Speech synthesis setup
  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);

  }, []);

  useEffect(() => {
    async function fetchWords() {
      try {
        console.log('words',progressSession.words);
        setLoading(true);
        
        var user_Id = await getCurrentUserId();
        setUserId(user_Id);

        // Then get vocabulary words for this section
        const { data: wordsData, error: wordsError } = await supabase
          .from('vocabulary')
          .select('*')
          .eq('chapter_id', chapter_id)
          .eq('section_id', section_id)
          // .is('origin', null)
          .in('word', progressSession.words);
        if (wordsError) throw wordsError;        
        
        if (wordsData) {
          setWords(wordsData as VocabularyWord[]);
          // Initialize userInput array with empty strings for the first word
          if (wordsData[0]) {
            const wordLength = wordsData[0].word.length;
            setUserInput(new Array(wordLength).fill(''));
            const isNewWord = progressSession.new_words?.includes(wordsData[0].word);
            setShowHints(isNewWord);
          }
        }

        // Get user progress
          const { data: mineLevelsData, error: mineLevelsError } = await supabase
          .from('mine_levels')
          .select('required_exp,level')
          .order('level', { ascending: true });  // 根據 level 排序
        if (mineLevelsError) throw mineLevelsError;
        const requiredExpArray = mineLevelsData.map(row => row.required_exp);
        setMineLevels(requiredExpArray);

        // Get user progress
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userProgressData, error: userProgressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('chapter_id', chapter_id)
            .eq('section_id', section_id)
            .single();
          if (userProgressError) throw userProgressError;
          setUserProgress(userProgressData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (section_id) {
      fetchWords();
    }

    correctAudio.load();
    wrongAudio.load();
  }, [section_id]);

  const hasSpokenRef = useRef(false);

  // Auto-speak the word when it changes
  useEffect(() => {
    if (hasSpokenRef.current) return; // 已經播過就不再播
    const currentWord = getCurrentWord();
    if (currentWord) {
      speak(currentWord.word);
      hasSpokenRef.current = true;
    }
  }, [currentWordIndex, speak, words]);

  const getCurrentWord = () => words[currentWordIndex];

  const handleInputChange = (index: number, value: string) => {
    if (feedback) return;

    const newInput = [...userInput];
    newInput[index] = value.toLowerCase();
    setUserInput(newInput);

    // if (value) {
    //   setShowHints(false);
    // }

    if (value && index < getCurrentWord().word.length - 1) {
      setFocusedIndex(index + 1);
    }

    // ✅ 這裡用 newInput 而不是舊的 userInput！
    if (newInput.every(letter => letter)) {
      checkAnswer(newInput);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !userInput[index] && index > 0) {
      // Move focus to previous input on backspace if current input is empty
      setFocusedIndex(index - 1);
    }
  };

  const moveToNextWord = () => {
    const nextIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(nextIndex);
    const nextWord = words[nextIndex];
    setUserInput(new Array(nextWord.word.length).fill(''));
    setFocusedIndex(0);
    setShowHints(true);
    setFeedback(null);
  };

  const checkAnswer = async (currentInput) => {
    const currentWord = getCurrentWord();
    const isCorrect = currentInput.join('') === currentWord.word.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    const wordCard = document.querySelector('.word-card');
    
    if (isCorrect) {
      //correctAudio.play();

      if(!isError)  setAnsweredWords((prevWords) => [...prevWords, currentWord.word]);

      // setComboCount(prev => prev + 1);
      handleCorrectAnswer();
      handleDig();


      // // ✅ 金幣掉落效果
      // confetti({
      //   particleCount: 20,
      //   angle: 90,
      //   spread: 55,
      //   origin: { y: 0, x: 0.5 },
      //   shapes: ['circle'],
      //   colors: ['#FFD700'],
      //   gravity: 1.2,
      //   scalar: 1.5
      // });

      // ✅ 單字漸亮效果
      wordCard?.classList.add('glow');
      wordCard?.classList.add('word-brighten');

      setTimeout(() => {
        wordCard?.classList.remove('glow');
        wordCard?.classList.remove('word-brighten');
      }, 1000);


      // ✅ 重點來了！正確答題後換下一題
      if (dailyProgress < progressSession.progress_gained) {
        setTimeout(() => {
          setFeedback(null);
          hasSpokenRef.current = false;
          const nextIndex = (currentWordIndex + 1) % words.length;
          const nextWord = words[nextIndex];
          console.log(nextWord);
          setCurrentWordIndex(nextIndex);
          setUserInput(new Array(nextWord.word.length).fill(''));
          setFocusedIndex(0);

          const isNewWord = progressSession.new_words?.includes(nextWord.word);
          setShowHints(isNewWord);

          setIsError(false); // 重置錯誤狀態
        }, 1200); // ✅ 注意：時間調一下讓動畫走完（太短會卡住）
      }
    } else {
      resetCombo();

      if(!isError)  {
        setWrongWords((prevWords) => [...prevWords, currentWord.word]);
        setIsError(true);
      }
      wrongAudio.play();

      if (navigator.vibrate) {
        navigator.vibrate(300);
      }

      void wordCard?.offsetWidth; // 強制 Reflow
      // wordCard?.classList.add('shake');
      setPickaxeDurability(prev => prev - 1); // 減少耐久度
      
      // 答錯後允許重新輸入
      setTimeout(() => {
        setUserInput(new Array(currentWord.word.length).fill(''));
        setFeedback(null); // 清除錯誤提示
        setFocusedIndex(0); // 重置焦點到第一個輸入框
        wordCard?.classList.remove('shake');
      }, 1000); // 短暫延遲以顯示錯誤動畫
    }

  };
  const restorePickaxe = async () => {
    showMiningFailure({
      title: '挖礦失敗',
      message: '十字鎬已損壞，無法繼續挖礦！',
    });
  };

  useEffect(() => {
    if(pickaxeDurability === 0){
      showMiningFailure({
        title: '挖礦失敗',
        message: '十字鎬已損壞，無法繼續挖礦！',
      });
    }
    
  }, [pickaxeDurability]);

  const handleClaimReward = async () => {
    // setLoading(true);
    setMessage(''); // 重置訊息

    try {
      // 調用 claim_mining_reward 函數
      const { data, error } = await supabase.rpc('claim_mining_reward', {
        p_user_id: userId,
        p_session_id: progressSession.id,
        answered_words: answeredWords,
        wrong_words: wrongWords,
      });

      if (error && 0) {
        setMessage(`錯誤：${error.message}`);
        toast.error(`錯誤：${error.message}`,
          {
            position: 'top-center',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
          }
        );
      } else {
        showMiningResult({
          title: location.state.sectionTitle || t('挖礦'),
          currentLevel: userProgress.level || 1,
          rewards: [
            { icon: '/images/kazzi.png', name: '咔滋幣', amount: progressSession.gems_earned },
          ],
          experienceArray: mineLevels,
          currentTotalExperience: userProgress.total_experience,
          gainedExperience: progressSession.exp_earned,
        });
      }
    } catch (err) {
      console.error('錯誤：', err);
      setMessage('操作失敗，請稍後再試！');
    } finally {
      // setLoading(false);
    }
  };

  const playDigSound = () => {
    correctAudio.volume = 0.8;
    correctAudio.play().catch(() => { });
  };

  // ✅ Combo 粒子效果
  const stoneShardA = confetti.shapeFromPath({
    path: 'M10 0 L14 -4 L18 0 L16 6 L12 8 L8 6 Z',
    matrix: [0.2, 0, 0, 0.2, -10, -5]
  });
  const stoneShardB = confetti.shapeFromPath({
    path: 'M12 0 L18 4 L16 10 L8 12 L4 6 Z',
    matrix: [0.2, 0, 0, 0.2, -10, -6]
  });
  const stoneShardC = confetti.shapeFromPath({
    path: 'M10 0 L13 -3 L16 0 L15 4 L11 6 L7 4 Z',
    matrix: [0.2, 0, 0, 0.2, -10, -5]
  });
  const targetRef = useRef(null);
  const levels = [
    { ticks: 30, particleCount: 5, startVelocity: 20, scalar: 5 },
    { ticks: 40, particleCount: 8, startVelocity: 30, scalar: 7 },
    { ticks: 45, particleCount: 12, startVelocity: 35, scalar: 9 },
    { ticks: 50, particleCount: 16, startVelocity: 40, scalar: 11 },
    { ticks: 55, particleCount: 20, startVelocity: 45, scalar: 13 },
    { ticks: 55, particleCount: 20, startVelocity: 45, scalar: 13 },
  ];
  const randomAngle = 50 + Math.random() * 70; // 50~120度
  const randomSpread = 70 + Math.random() * 30; // 70~100度
  const randomParticleMultiplier = Math.random() * 1.5 + 0.5; // 粒子數量倍數 0.5~2
  const randomScalar = Math.random() * 0.4 + 0.8; // 粒子數量倍數 0.8~1.2
  const handleDig = () => {
    // 觸發挖掘動畫
    setAnimationClass('animate-dig');
    setParticleKey((k) => k + 1);
    playDigSound();

    setTimeout(() => setAnimationClass(''), 400);

    const rect = targetRef.current.getBoundingClientRect();
    const originX = rect.left + rect.width * 0.75;
    const originY = rect.top + rect.height * 0.8;
    const percentX = originX / window.innerWidth;
    const percentY = originY / window.innerHeight;


    const { ticks, particleCount, startVelocity, scalar } = levels[comboLevel];

    const rockCount = Math.floor(particleCount * randomParticleMultiplier)
    setDailyProgress(prev => prev + rockCount);
    confetti({
      particleCount: rockCount,
      angle: randomAngle,
      spread: randomSpread,
      startVelocity: startVelocity,
      ticks: ticks,
      gravity: 3.5,
      drift: (Math.random() - 0.5) * 1, // -1 ~ 1 之間，隨機左右偏移
      decay: 0.9,
      useWorker: false,
      scalar: scalar * randomScalar,
      origin: { x: percentX, y: percentY }, // targetRef 動態位置
      flat: true,
      shapes: [stoneShardA, stoneShardB, stoneShardC],
      colors: ['#A8A29E', '#D1D5DB', '#9CA3AF'],
    });

    console.log('dailyProgress', dailyProgress,progressSession.progress_gained);

  };

  useEffect(() => {
    if (dailyProgress >= progressSession.progress_gained) {
      handleClaimReward();
    }
  }, [dailyProgress]);
  
  const [comboLevel, setComboLevel] = useState(0);
  const lastAnswerTimeRef = useRef<number | null>(null);

  const MAX_COMBO_COUNT = 15; // 0~4，共 5 級
  const MAX_COMBO_LEVEL = 5; // 0~4，共 5 級

  const comboLevels = [
    {
      text: 'Nice!',comboInterval: 10000,
      colors: ['#ffffff', '#e5e7eb', '#d6d3d1'], // 白 → 淺灰 → 深灰
    },
    {
      text: 'Good!', comboInterval: 8000,
      colors: ['#bbf7d0', '#86efac', '#22c55e'], // 淡綠 → 綠 → 深綠
    },
    {
      text: 'Great!', comboInterval: 6000,
      colors: ['#bfdbfe', '#60a5fa', '#3b82f6'], // 淡藍 → 藍 → 深藍
    },
    {
      text: 'Excellent!',comboInterval: 5000,
      colors: ['#fef9c3', '#fde047', '#fdf80c'], // 淡黃 → 黃 → 深黃
    },
    {
      text: 'Fantastic!',comboInterval: 5000,
      colors: ['#e9d5ff', '#c084fc', '#a855f7'], // 淡紫 → 紫 → 深紫
    },
    {
      text: 'Perfect!',comboInterval: 5000,
      colors: ['#daa520', '#daa520', '#daa520'], // 金黃色系
    },
  ];
  
  const comboLevelData = comboLevels[comboLevel];
  const currentColor = comboLevelData.colors[comboCount<=MAX_COMBO_COUNT ? comboCount % 3 : 2];
  const progress = 1; // (comboCount % 3) / 3;
  const textStyle = {
    backgroundImage: `linear-gradient(to right,${currentColor} ${progress * 100}%,${currentColor} ${progress * 100}%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    transition: 'background-image 0.3s ease',
  };

  const [comboLevelUpClass, setComboLevelUpClass] = useState('');
  useEffect(() => {
    if (comboLevel == MAX_COMBO_LEVEL) {
      setComboLevelUpClass('animate-comboLevelUp');
      const timer = setTimeout(() => setComboLevelUpClass('animate-comboShakeStrong'), 400);
      return () => clearTimeout(timer);
    }else if (comboLevel > 0) {
      setComboLevelUpClass('animate-comboLevelUp');
      const timer = setTimeout(() => setComboLevelUpClass('animate-comboShake'), 400);
      return () => clearTimeout(timer);
    }else if(comboCount == 1){      
      setComboLevelUpClass('animate-comboLevelUp');
      const timer = setTimeout(() => setComboLevelUpClass(''), 400);
      return () => clearTimeout(timer);
    }else{
      setComboLevelUpClass('')
    }
  }, [comboLevel,comboCount]);


  const handleCorrectAnswer = () => {
    handleComboSuccess();
    showComboDisplay();
    const now = Date.now();

    if (lastAnswerTimeRef.current && now - lastAnswerTimeRef.current <= comboLevelData.comboInterval) {
      // ✅ 在時間內，combo count +1
      const newComboCount = comboCount + 1;
      let newComboLevel = comboLevel;

      // 每 3 個升級一次
      if (newComboCount % 3 === 0) {
        newComboLevel = Math.min(comboLevel + 1, MAX_COMBO_LEVEL);
      }

      // 分開 setState ✅
      setComboCount(newComboCount);
      if (newComboLevel !== comboLevel) {
        setComboLevel(newComboLevel);
      }

    } else {
      // ⛔️ 超過時間，combo count 重新計數，但等級維持
      resetCombo();
    }

    lastAnswerTimeRef.current = now;
  };

  const resetCombo = () => {
    setComboCount(0); // 重新從 1 開始
    setComboLevel(0); // 等級歸零
    setAnimationClass('');
    setShowCombo(false);
  }

  const [currentSpeech, setCurrentSpeech] = useState('你好！我是土波！');
  const [showSpeech, setShowSpeech] = useState(true);

  // // 自動淡出對話框
  // useEffect(() => {
  //   if (showSpeech) {
  //     const timer = setTimeout(() => setShowSpeech(false), 2500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showSpeech]);

  // 當 Combo 成功時觸發對話
  const handleComboSuccess = () => {
    const messages = ['好耶！再接再厲！', '超厲害！', '土波好感動！'];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentSpeech(randomMessage);
    setShowSpeech(true);
  };


  // Combo 淡出效果
  const [showCombo, setShowCombo] = useState(false);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showComboDisplay = () => {
    setShowCombo(true);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setShowCombo(false), comboLevelData.comboInterval); // 1.5 秒後隱藏
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-12" style={{ height: '100%' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const currentWord = getCurrentWord();
  if (!currentWord) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-stone-800 p-6 rounded-xl text-center">
          <p className="text-stone-400">{t('no_words')}</p>
        </div>
      </div>
    );
  }

  // Split syllables by semicolon
  const syllables = currentWord.syllables.split(';');

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* 返回箭頭 */}
        <Link
          to="/"
          className="flex text-3xl font-bold text-amber-500"
        >
          <ChevronLeft className="w-10 h-9 mr-1" />
          {location.state?.sectionTitle || t('挖礦')}
        </Link>


        {userStats && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-stone-800 px-3 py-1.5 rounded-lg">
              <CoinIcon size={20} className="text-amber-500" />
              <span className="text-lg font-semibold">
                {userStats.gems || 0}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-stone-800 px-3 py-1.5 rounded-lg">
              <CoinIcon type="diamond" size={20} className="text-blue-500" />
              <span className="text-lg font-semibold">
                {userStats.diamonds || 0}
              </span>
            </div>
          </div>
        )}
      </div>
      {/* 礦層圖 */}
      <div className="relative bg-stone-900 rounded-xl mb-6" style={{ height: '400px', width: '750px' }}>
        {/* 進度條 */}
        <div className="absolute top-0 left-0 w-full">
          <RewardProgress
            progress={dailyProgress}
            totalWords={progressSession.progress_gained}
          />
        </div>

        <div className="absolute top-5 left-0 w-full">
          <div className="flex justify-end mb-6 justify-end pr-2">
            <PickaxeDurability
              durability={pickaxeDurability}
              onRestore={restorePickaxe}
            />
          </div>
        </div>

      {/* Word Card */}
      <div className="absolute top-20 word-card bg-stone-800 rounded-xl" style={{ maxWidth: '650px', width:'90%',left:'5%'}}>
        <div className="relative mt-1">
          {/* 詞性 + 單詞：絕對定位居中 */}
          <div className="absolute inset-x-0 flex justify-center items-center gap-2">
            {currentWord.part_of_speech && (
              <span className="text-amber-400">
                {'[ ' + currentWord.part_of_speech + ' ]'}
              </span>
            )}
            <h2 className="text-2xl font-bold text-amber-500">
              {currentWord.definition}
            </h2>
            {currentWord.part_of_speech2 && (
              <span className="text-amber-400">
                {'[ ' + currentWord.part_of_speech2 + ' ]'}
              </span>
            )}
            <h2 className="text-2xl font-bold text-amber-500">
              {currentWord.definition2}
            </h2>
            {currentWord.part_of_speech3 && (
              <span className="text-amber-400">
                {'[ ' + currentWord.part_of_speech3 + ' ]'}
              </span>
            )}
            <h2 className="text-2xl font-bold text-amber-500">
              {currentWord.definition3}
            </h2>
          </div>

          {/* 喇叭按鈕：正常 flow，放右側 */}
          <div className="flex justify-end">
            <button
              onClick={() => { hasSpokenRef.current = false; speak(currentWord.word); }}
              className="p-2 hover:bg-stone-700 rounded-full transition-colors flex items-center justify-center relative z-10"
              title="Listen to pronunciation"
            >
              <Volume2 className="w-5 h-5 text-amber-500" />
            </button>
          </div>
        </div>
        </div>

        <div className="absolute bottom-5 word-card bg-stone-800 rounded-xl" style={{ maxWidth: '650px', width:'90%',left:'5%',zIndex: 10,opacity: 0.8 }}>
        <div className="relative space-y-4">
          {/* Word Input */}
          <div>
            <div className="flex justify-center mb-4 mt-1">
              <div className="flex gap-4">
                {syllables.map((syllable, syllableIndex) => (
                  <div
                    key={syllableIndex}
                    className="flex gap-1"
                  >
                    {syllable.split('').map((letter, letterIndex) => {
                      const globalIndex = syllables
                        .slice(0, syllableIndex)
                        .join('')
                        .length + letterIndex;

                      return (
                        <div key={letterIndex} className="relative">
                          <input
                            type="text"
                            maxLength={1}
                            value={userInput[globalIndex] || ''}
                            onChange={(e) => handleInputChange(globalIndex, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                            ref={focusedIndex === globalIndex ? (input) => input?.focus() : undefined}
                            style={{ caretColor: 'transparent' }}
                            className={`w-8 h-8 text-center bg-transparent border-b-2 focus:outline-none ${feedback === 'correct'
                              ? 'border-green-500 text-green-500 focus:border-green-500 focus:text-green-500'
                              : feedback === 'incorrect'
                                ? 'border-red-500 text-red-500 focus:border-red-500 focus:text-red-500'
                                : 'border-amber-400 text-amber-400 focus:border-amber-600 focus:text-amber-500'
                              }`}
                            disabled={feedback !== null || pickaxeDurability === 0}
                          />
                          {showHints && !userInput[globalIndex] && (
                            <span className="absolute inset-0 flex items-center justify-center text-amber-400 text-opacity-50 pointer-events-none">
                              {letter}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback === 'incorrect' && (
            <div className={`text-center font-medium ${feedback === 'incorrect' ? 'text-red-500' : 'text-green-500'
              }`}>
              {feedback === 'incorrect' ? '錯誤! 再試一次' : ''}
            </div>
          )}

          {pickaxeDurability === 0 && (
            <div className="text-center text-red-500">
              Your pickaxe is broken! Restore it to continue mining.
            </div>
          )}
        </div>
      </div>

        {/* Combo 效果 */}
        {showCombo && (
          <div className="absolute left-0 w-full flex justify-end pr-3 pointer-events-none" style={{ top:'30%' }}>
            <div
              className={`text-2xl font-extrabold italic mt-2 mb-2 pr-2 transition-all duration-300 ${comboLevelUpClass} ${currentColor} `}
              style={textStyle}
            >
              {comboCount < MAX_COMBO_COUNT ? 'combo x ' + comboCount : 'combo!!'}
            </div>
          </div>
        )}

        {/* 礦層背景 */}
        <img
          src={MineralLayer1}
          alt="Mineral Layer"
          className="w-full h-full object-fill rounded-lg"
        />

        {/* 礦石 */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${animationClass}
            }`}
          style={{ position: 'absolute', top: '70px' }}
        >
          <img
            ref={targetRef}
            src={ore1}
            alt="Ore"
            style={{ width: '250px', height: '200px' }}
            className="w-16 h-16"
          ></img>
        </div>

        {/* 土波 */}
        <div
          className={`absolute inset-0 items-center justify-center }
            }`}
          style={{ top: '60%', left: '0%' }}
        >
          {/* 對話框 */}
          <div className="relative">
            <img
              src={tubo}
              alt="tubo"
              style={{ width: '150px', height: '150px' }}
              className="w-16 h-16"
            />
            <TopoSpeechBubble text={currentSpeech} show={showSpeech} isMobile={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
const useRef = React.useRef;
