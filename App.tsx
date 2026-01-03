
import React, { useState, useEffect, useRef } from 'react';
import { CatInstance } from './types';
import { sendMessage, initChat } from './services/geminiService';
import CatItem from './components/CatItem';

const CAT_TYPES: Array<CatInstance['type']> = ['ragdoll', 'british', 'calico', 'tuxedo'];
const CAT_NAMES = ['糯米', '团子', '雪球', '煤球', '花花', '大白', '芝麻', '年糕', '小虎', '阿花'];
const MAX_CATS = 12; // 限制猫咪数量防止性能问题

interface EnhancedCat extends CatInstance {
  vx: number;
  vy: number;
  isJumping: boolean;
  isSleeping: boolean;
  isGroggy: boolean;
  energy: number;
}

const App: React.FC = () => {
  const [cats, setCats] = useState<EnhancedCat[]>([
    { id: '1', type: 'ragdoll', x: 50, y: 60, scale: 1.2, name: '糯米', vx: 0.04, vy: 0.02, isJumping: false, isSleeping: false, isGroggy: false, energy: 80 }
  ]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [thought, setThought] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [dbLevel, setDbLevel] = useState(0);
  const [dbThreshold, setDbThreshold] = useState(25);
  const [isTooLoud, setIsTooLoud] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const thresholdRef = useRef(25);

  // 进度条百分比：(60 - timeLeft) / 60 * 100
  const unlockProgress = Math.max(0, Math.min(100, ((60 - timeLeft) / 60) * 100));

  useEffect(() => {
    thresholdRef.current = dbThreshold;
  }, [dbThreshold]);

  useEffect(() => {
    initChat();

    // 统一计时器：每秒更新一次
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 倒计时结束，尝试添加新猫咪
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 状态更新循环：体力消耗与回复
    const statsInterval = setInterval(() => {
      setCats(prevCats => prevCats.map(cat => {
        let newEnergy = cat.energy;
        let newSleeping = cat.isSleeping;
        let newGroggy = cat.isGroggy;

        if (cat.isSleeping) {
          const recoveryRate = dbLevel < thresholdRef.current ? 2.5 : 0.5;
          newEnergy = Math.min(100, cat.energy + recoveryRate);
          
          if (newEnergy >= 100) {
            newSleeping = false;
            newGroggy = true;
            setTimeout(() => {
              setCats(curr => curr.map(c => c.id === cat.id ? { ...c, isGroggy: false } : c));
            }, 5000);
          }
        } else {
          const drainRate = (Math.abs(cat.vx) + Math.abs(cat.vy)) > 0 ? 0.4 : 0.2;
          newEnergy = Math.max(0, cat.energy - drainRate);
          
          if (newEnergy < 5) newSleeping = true;
          if (newEnergy < 40 && Math.random() < 0.002) newSleeping = true;
        }

        return { ...cat, energy: newEnergy, isSleeping: newSleeping, isGroggy: newGroggy };
      }));
    }, 2000);

    // 移动逻辑循环
    const movementInterval = setInterval(() => {
      setCats(prevCats => prevCats.map(cat => {
        if (cat.isSleeping) return { ...cat, vx: 0, vy: 0 };

        const speedMultiplier = cat.isGroggy ? 0.3 : 1.0;
        const shouldJump = !cat.isJumping && !cat.isGroggy && Math.random() < 0.008;
        
        let nx = cat.x + (cat.vx * speedMultiplier);
        let ny = cat.y + (cat.vy * speedMultiplier);
        let nvx = cat.vx;
        let nvy = cat.vy;

        if (nx < 10 || nx > 90) nvx = -nvx;
        if (ny < 45 || ny > 85) nvy = -nvy;

        if (Math.random() < 0.01) {
          nvx = (Math.random() - 0.5) * 0.15;
          nvy = (Math.random() - 0.5) * 0.15;
        }

        return { 
          ...cat, 
          x: nx, 
          y: ny, 
          vx: nvx, 
          vy: nvy,
          isJumping: shouldJump ? true : cat.isJumping 
        };
      }));
    }, 50);

    startAudioMonitor();

    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
      clearInterval(movementInterval);
      stopAudioMonitor();
    };
  }, []);

  // 监听 timeLeft 变化，当变为 0 时触发添加猫咪逻辑
  useEffect(() => {
    if (timeLeft === 0) {
      if (cats.length < MAX_CATS) {
        addCat();
      } else {
        // 如果花园满了，只重置计时器
        setTimeLeft(60);
      }
    }
  }, [timeLeft, cats.length]);

  const startAudioMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;
        const db = Math.round((average / 255) * 100);
        setDbLevel(db);

        if (db > thresholdRef.current) {
          setIsTooLoud(true);
          setCats(prev => prev.map(cat => {
            if (cat.isSleeping) {
                setTimeout(() => {
                    setCats(curr => curr.map(c => c.id === cat.id ? { ...c, isGroggy: false } : c));
                }, 4000);
                return { ...cat, isSleeping: false, isGroggy: true, energy: Math.max(0, cat.energy - 8) };
            }
            return cat;
          }));
          if (Math.random() < 0.05) triggerRunAway();
        } else {
          setIsTooLoud(false);
        }
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err) {
      console.warn("未授权麦克风，环境监测已关闭");
    }
  };

  const stopAudioMonitor = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
  };

  const triggerRunAway = () => {
    setCats(prev => {
      if (prev.length <= 1) return prev;
      const newCats = [...prev];
      newCats.pop();
      return newCats;
    });
    setThought("太吵了，我要去找个安静的地方喵！");
    setTimeout(() => setThought(null), 3000);
  };

  const addCat = () => {
    const newCat: EnhancedCat = {
      id: Math.random().toString(36).substr(2, 9),
      type: CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)],
      x: 20 + Math.random() * 60,
      y: 50 + Math.random() * 30,
      scale: 0.8 + Math.random() * 0.4,
      name: CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)],
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      isJumping: false,
      isSleeping: false,
      isGroggy: false,
      energy: 100
    };
    setCats(prev => [...prev, newCat]);
    setTimeLeft(60); // 重置倒计时
    setThought(`新伙伴 ${newCat.name} 加入了花园喵！`);
    setTimeout(() => setThought(null), 4000);
  };

  const toggleAllSleep = () => {
    const allSleeping = cats.every(c => c.isSleeping);
    setCats(prev => prev.map(c => ({ ...c, isSleeping: !allSleeping, isGroggy: allSleeping })));
    setThought(allSleeping ? "大家醒醒喵！" : "嘘... 大家休息一下喵。");
  };

  const handleCatClick = async (id: string) => {
    const cat = cats.find(c => c.id === id);
    if (!cat) return;

    if (cat.isSleeping) {
      setCats(prev => prev.map(c => c.id === id ? { ...c, isSleeping: false, isGroggy: true } : c));
      setThought("呼哈... 哈欠~ 还没睡够呢喵。");
      setTimeout(() => {
        setCats(curr => curr.map(c => c.id === id ? { ...c, isGroggy: false } : c));
      }, 5000);
    } else {
      setCats(prev => prev.map(c => c.id === id ? { ...c, isJumping: true, vx: 0, vy: 0 } : c));
      setThought("喵呜？找我玩吗？");
    }
    
    setSelectedCatId(id);
    setIsSidebarOpen(true);
    const response = await sendMessage(`我是${cat.name}，你刚才${cat.isSleeping ? '把我弄醒了' : '摸了摸我'}。我现在觉得${cat.isSleeping ? '好困呀' : '很有精神'}，体力${Math.round(cat.energy)}%。`);
    setThought(response);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden garden-gradient">
      {isTooLoud && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-red-500/10 pointer-events-none text-center">
           <div className="bg-white/90 border-4 border-red-500 px-8 py-4 rounded-3xl shadow-2xl animate-pulse">
              <h2 className="text-4xl font-black text-red-600 font-artistic mb-2">太吵了喵！</h2>
              <p className="text-red-400 font-bold">噪音指数: {dbLevel} dB</p>
           </div>
        </div>
      )}

      {/* Top UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-30">
        <div className="glass-panel px-6 py-2.5 rounded-full flex items-center justify-between shadow-lg border border-white/40">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">新伙伴倒计时</span>
              <span className="text-indigo-600 font-black leading-none">
                {cats.length >= MAX_CATS ? '花园已满' : `${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,'0')}`}
              </span>
            </div>
            <div className="h-1.5 w-24 bg-gray-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000" 
                style={{ width: `${cats.length >= MAX_CATS ? 100 : unlockProgress}%` }} 
              />
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase">环境噪音</span>
              <span className={`font-black leading-none ${dbLevel > dbThreshold ? 'text-red-500' : 'text-emerald-600'}`}>
                {dbLevel < dbThreshold ? '🤫 宜午睡' : '⚠️ 太嘈杂'} ({dbLevel}dB)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
        <div className="bg-yellow-400 border-4 border-black px-8 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-artistic text-black">猫咪陪伴自习室</h2>
        </div>
      </div>

      <div className="relative w-full h-full">
        {cats.map(cat => (
          <CatItem 
            key={cat.id} 
            cat={cat} 
            vx={cat.vx}
            isJumping={cat.isJumping}
            isSleeping={cat.isSleeping}
            onJumpEnd={() => setCats(prev => prev.map(c => c.id === cat.id ? { ...c, isJumping: false } : c))}
            onClick={handleCatClick} 
            thought={selectedCatId === cat.id ? thought : (thought?.includes(cat.name) ? thought : null)}
          />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex justify-center w-full px-4">
        <div className="glass-panel px-6 py-3 rounded-full flex flex-wrap justify-center items-center gap-6 shadow-xl border border-white/50">
          <div className="flex items-center gap-3">
             <i className={`fas ${dbLevel > dbThreshold ? 'fa-volume-up text-red-500' : 'fa-volume-mute text-orange-400'} text-sm`}></i>
             <input 
               type="range" min="10" max="70" value={dbThreshold} 
               onChange={(e) => setDbThreshold(parseInt(e.target.value))}
               className="w-24 md:w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addCat} 
              disabled={cats.length >= MAX_CATS}
              className={`text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md active:scale-95 transition-all ${cats.length >= MAX_CATS ? 'bg-gray-400' : 'bg-indigo-500 hover:bg-indigo-600'}`}
            >
              <i className="fas fa-plus mr-2"></i>召唤新伙伴
            </button>
            <button onClick={toggleAllSleep} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md active:scale-95 transition-all">
              <i className={`fas ${cats.every(c => c.isSleeping) ? 'fa-sun' : 'fa-moon'} mr-2`}></i>集体午睡
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[320px] glass-panel z-50 transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 bg-orange-500 text-white flex justify-between items-center shadow-lg rounded-bl-3xl">
            <h3 className="font-bold text-xl">猫咪动态</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="hover:rotate-90 transition-transform p-2"><i className="fas fa-times text-xl"></i></button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-white/30 space-y-6">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 text-orange-900 leading-relaxed font-medium relative">
                <i className="fas fa-quote-left absolute top-2 left-2 opacity-10 text-4xl"></i>
               {thought || "（猫咪静悄悄的...）"}
             </div>
             {selectedCatId && (
               <div className="p-4 bg-white/80 rounded-2xl border border-orange-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-orange-400 uppercase tracking-wider">能量状态</span>
                    <span className="text-sm font-black text-orange-600">{Math.round(cats.find(c => c.id === selectedCatId)?.energy || 0)}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-200/50 rounded-full overflow-hidden border border-gray-100">
                    <div 
                      className={`h-full transition-all duration-1000 ${ (cats.find(c => c.id === selectedCatId)?.energy || 0) < 20 ? 'bg-red-400' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`}
                      style={{ width: `${cats.find(c => c.id === selectedCatId)?.energy || 0}%` }}
                    />
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 italic">
                    { (cats.find(c => c.id === selectedCatId)?.isSleeping) ? "💤 深度睡眠中，能量飞速恢复..." : "🐾 活动中，建议在安静环境下休息。" }
                  </p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
