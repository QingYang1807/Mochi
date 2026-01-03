
import React, { useState, useEffect, useRef } from 'react';
import { CatInstance } from './types';
import { sendMessage, initChat } from './services/geminiService';
import CatItem from './components/CatItem';

const CAT_TYPES: Array<CatInstance['type']> = ['ragdoll', 'british', 'calico', 'tuxedo'];
const CAT_NAMES = ['糯米', '团子', '雪球', '煤球', '花花', '大白'];

interface EnhancedCat extends CatInstance {
  vx: number;
  vy: number;
  isJumping: boolean;
}

const App: React.FC = () => {
  const [cats, setCats] = useState<EnhancedCat[]>([
    { id: '1', type: 'ragdoll', x: 50, y: 60, scale: 1.2, name: '糯米', vx: 0.04, vy: 0.02, isJumping: false }
  ]);
  const [unlockProgress, setUnlockProgress] = useState(35);
  const [timeLeft, setTimeLeft] = useState(45);
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

  useEffect(() => {
    thresholdRef.current = dbThreshold;
  }, [dbThreshold]);

  useEffect(() => {
    initChat();
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      setUnlockProgress(prev => Math.min(100, prev + 0.1));
    }, 1000);

    const movementInterval = setInterval(() => {
      setCats(prevCats => prevCats.map(cat => {
        const shouldJump = !cat.isJumping && Math.random() < 0.008;
        
        let nx = cat.x + cat.vx;
        let ny = cat.y + cat.vy;
        let nvx = cat.vx;
        let nvy = cat.vy;

        // 调整边界，确保猫咪不跑到状态栏或标题下方
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
      clearInterval(movementInterval);
      stopAudioMonitor();
    };
  }, []);

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
    setThought("太吵了，吓死我了喵！");
    setTimeout(() => setThought(null), 3000);
  };

  const addCat = () => {
    const newCat: EnhancedCat = {
      id: Math.random().toString(),
      type: CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)],
      x: 20 + Math.random() * 60,
      y: 50 + Math.random() * 30, // 初始位置偏下
      scale: 0.8 + Math.random() * 0.4,
      name: CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)],
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      isJumping: false
    };
    setCats([...cats, newCat]);
    setUnlockProgress(0);
    setTimeLeft(60);
  };

  const handleCatClick = async (id: string) => {
    const cat = cats.find(c => c.id === id);
    if (!cat) return;
    setCats(prev => prev.map(c => c.id === id ? { ...c, isJumping: true, vx: 0, vy: 0 } : c));
    setSelectedCatId(id);
    setIsSidebarOpen(true);
    setThought("喵呜？你在叫我吗？");
    const response = await sendMessage(`我是${cat.name}，你刚才拍了拍我。`);
    setThought(response);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden garden-gradient">
      {/* 噪音警告叠加层 */}
      {isTooLoud && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-red-500/10 pointer-events-none">
           <div className="bg-white/90 border-4 border-red-500 px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
              <h2 className="text-3xl font-black text-red-600 font-artistic">安静点喵！({dbLevel}dB)</h2>
           </div>
        </div>
      )}

      {/* 顶部状态栏 - 优化尺寸防止遮挡 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-30">
        <div className="glass-panel px-6 py-2.5 rounded-full flex items-center justify-between shadow-lg border border-white/40">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">New Cat</span>
              <span className="text-indigo-600 font-black leading-none">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</span>
            </div>
            <div className="h-1.5 w-24 bg-gray-200/50 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${unlockProgress}%` }} />
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Volume</span>
              <span className={`font-black leading-none ${dbLevel > dbThreshold ? 'text-red-500' : 'text-emerald-600'}`}>{dbLevel} dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 中心标题 - 移动到 top-24 并调整间距 */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
        <div className="bg-yellow-400 border-4 border-black px-8 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-artistic text-black">我的精致猫咪花园</h2>
        </div>
        <div className="mt-2 text-xs font-bold text-black/40 bg-white/20 px-3 py-0.5 rounded-full inline-block backdrop-blur-sm">
           环境阈值：{dbThreshold} dB
        </div>
      </div>

      {/* 花园主体 */}
      <div className="relative w-full h-full">
        {cats.map(cat => (
          <CatItem 
            key={cat.id} 
            cat={cat} 
            vx={cat.vx}
            isJumping={cat.isJumping}
            onJumpEnd={() => setCats(prev => prev.map(c => c.id === cat.id ? { ...c, isJumping: false } : c))}
            onClick={handleCatClick} 
            thought={selectedCatId === cat.id ? thought : null}
          />
        ))}
      </div>

      {/* 底部控制 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex justify-center w-full px-4">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-xl border border-white/50">
          <div className="flex items-center gap-3">
             <i className="fas fa-volume-up text-orange-500 text-sm"></i>
             <input 
               type="range" min="10" max="70" value={dbThreshold} 
               onChange={(e) => setDbThreshold(parseInt(e.target.value))}
               className="w-20 md:w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
          </div>
          <div className="flex gap-2">
            <button onClick={addCat} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">添加猫咪</button>
            <button onClick={() => setCats([{ ...cats[0], id: Date.now().toString(), x: 50, y: 60 }])} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">重置花园</button>
          </div>
        </div>
      </div>

      {/* 侧边栏 */}
      <div className={`fixed top-0 right-0 h-full w-[320px] glass-panel z-50 transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 bg-orange-500 text-white flex justify-between items-center shadow-lg">
            <h3 className="font-bold text-xl">猫咪心情</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="hover:rotate-90 transition-transform"><i className="fas fa-times text-xl"></i></button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-white/30">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 text-orange-900 leading-relaxed font-medium">
               {thought || "（猫咪正在打盹...）"}
             </div>
             <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                   <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500"><i className="fas fa-paw"></i></div>
                   <span>点击草坪上的猫咪可以和它交流</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
