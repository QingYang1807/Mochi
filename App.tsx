
import React, { useState, useEffect, useRef } from 'react';
import { CatInstance, GardenState } from './types';
import { sendMessage, initChat } from './services/geminiService';
import CatItem from './components/CatItem';
import { CAT_ASSETS } from './constants';

const CAT_TYPES: Array<CatInstance['type']> = ['ragdoll', 'british', 'calico', 'tuxedo'];
const CAT_NAMES = ['糯米', '团子', '雪球', '煤球', '花花', '大白'];

const App: React.FC = () => {
  const [cats, setCats] = useState<CatInstance[]>([
    { id: '1', type: 'ragdoll', x: 50, y: 40, scale: 1.2, name: '糯米' }
  ]);
  const [unlockProgress, setUnlockProgress] = useState(35);
  const [timeLeft, setTimeLeft] = useState(45);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [thought, setThought] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // 声音监测状态
  const [dbLevel, setDbLevel] = useState(0);
  const [dbThreshold, setDbThreshold] = useState(15); // 默认阈值 15dB
  const [isTooLoud, setIsTooLoud] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const thresholdRef = useRef(15); // 使用 ref 同步给 requestAnimationFrame 回调

  useEffect(() => {
    thresholdRef.current = dbThreshold;
  }, [dbThreshold]);

  useEffect(() => {
    initChat();
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      setUnlockProgress(prev => Math.min(100, prev + 0.1));
    }, 1000);

    startAudioMonitor();

    return () => {
      clearInterval(timer);
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
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const db = Math.round((average / 255) * 100);
        setDbLevel(db);

        // 使用最新的阈值进行判断
        if (db > thresholdRef.current) {
          triggerRunAway();
        } else {
          setIsTooLoud(false);
        }
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err) {
      console.error("无法访问麦克风:", err);
    }
  };

  const stopAudioMonitor = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
  };

  const triggerRunAway = () => {
    setIsTooLoud(true);
    setCats(prev => {
      if (prev.length <= 1) return prev;
      const newCats = [...prev];
      newCats.pop();
      return newCats;
    });
    setThought("太吵了！我先溜了喵！");
    setTimeout(() => setThought(null), 2000);
  };

  const addCat = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    const newCat: CatInstance = {
      id: Math.random().toString(),
      type: CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)],
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 50,
      scale: 0.8 + Math.random() * 0.5,
      name: CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)]
    };
    setCats([...cats, newCat]);
    setUnlockProgress(0);
    setTimeLeft(60);
  };

  const resetGarden = () => {
    setCats([{ id: '1', type: 'ragdoll', x: 50, y: 40, scale: 1.2, name: '糯米' }]);
  };

  const handleCatClick = async (id: string) => {
    const cat = cats.find(c => c.id === id);
    if (!cat) return;
    
    setSelectedCatId(id);
    setIsSidebarOpen(true);
    setThought("喵呜？找我有事吗...");
    
    const response = await sendMessage(`我是${cat.name}，你刚才摸了我一下。`);
    setThought(response);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden garden-gradient">
      
      {/* 噪音警告浮层 */}
      {isTooLoud && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-red-500/20 pointer-events-none animate-pulse">
           <div className="bg-white border-8 border-red-500 text-red-600 px-12 py-6 rounded-3xl shadow-2xl scale-110">
              <h2 className="text-6xl font-black font-artistic animate-bounce">嘘！太吵了！</h2>
              <p className="text-center font-bold text-xl mt-2">当前分贝：{dbLevel}dB (限制：{dbThreshold}dB)</p>
           </div>
        </div>
      )}

      {/* 装饰性小草 */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div 
          key={i} 
          className="grass-tuft opacity-20"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        />
      ))}

      {/* 顶部状态栏 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-30 flex gap-4">
        <div className="glass-panel flex-1 px-8 py-4 rounded-[2rem] flex items-center justify-between shadow-2xl border-2 border-white/50">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-bold mb-1">解锁倒计时</span>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 text-2xl font-black">{formatTime(timeLeft)}</span>
              <span className="text-indigo-400 font-bold text-lg">解锁新猫咪</span>
            </div>
          </div>
          
          {/* 分贝计指示 */}
          <div className="flex flex-col items-center px-4 border-l border-gray-200 ml-4">
            <span className="text-[10px] font-bold text-gray-400 mb-1">环境分贝</span>
            <div className={`text-xl font-black transition-colors ${dbLevel > dbThreshold ? 'text-red-500' : 'text-emerald-500'}`}>
              {dbLevel} <span className="text-[10px]">dB</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden relative">
               <div 
                className={`h-full transition-all ${dbLevel > dbThreshold ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (dbLevel/100)*100)}%` }}
               />
               {/* 阈值标记线 */}
               <div 
                 className="absolute top-0 w-0.5 h-full bg-black/30"
                 style={{ left: `${dbThreshold}%` }}
               />
            </div>
          </div>

          <div className="flex-1 max-w-[150px] ml-4">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
              <span>解锁进度</span>
            </div>
            <div className="h-3 w-full bg-gray-200/50 rounded-full overflow-hidden border border-white">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000"
                style={{ width: `${unlockProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="glass-panel px-6 py-4 rounded-[2rem] flex flex-col items-center justify-center min-w-[80px]">
           <span className="text-gray-500 text-[10px] font-bold">解锁猫咪</span>
           <span className="text-rose-500 text-2xl font-black">{cats.length}</span>
        </div>
      </div>

      {/* 中心标题 */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none select-none">
        <div className="relative">
          <div className="bg-yellow-400 border-4 border-black px-12 py-4 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl md:text-7xl font-artistic text-black whitespace-nowrap">
              “电子养猫”
            </h2>
          </div>
        </div>
        <div className="mt-14 bg-rose-200/80 px-8 py-2 rounded-lg border-2 border-rose-300">
           <p className="text-rose-600 font-bold text-xl md:text-3xl font-artistic italic">当前允许音量：{dbThreshold} dB</p>
        </div>
      </div>

      {/* 花园主体 */}
      <div className={`relative w-full h-full transition-transform duration-700 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
        {cats.map(cat => (
          <CatItem 
            key={cat.id} 
            cat={cat} 
            onClick={handleCatClick} 
            thought={selectedCatId === cat.id ? thought : null}
          />
        ))}
      </div>

      {/* 底部按钮及阈值控制 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full px-4 flex justify-center">
        <div className="glass-panel px-6 py-3 rounded-[2.5rem] flex items-center gap-6 shadow-2xl flex-wrap justify-center">
          
          {/* 阈值调节滑动条 */}
          <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-gray-100">
             <i className="fas fa-volume-up text-orange-500"></i>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-500 uppercase">老师设置阈值</span>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  value={dbThreshold} 
                  onChange={(e) => setDbThreshold(parseInt(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
             </div>
             <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md min-w-[35px] text-center">
               {dbThreshold}
             </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={addCat}
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              添加猫咪
            </button>
            <button 
              onClick={resetGarden}
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              重置花园
            </button>
            <div className="h-8 w-px bg-gray-300 mx-1"></div>
            <button 
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-emerald-400 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              {isZoomed ? '缩小' : '放大'}
            </button>
          </div>
        </div>
      </div>

      {/* 页码 */}
      <div className="absolute bottom-8 right-8 z-30 hidden md:block">
        <div className="bg-black/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-black text-2xl">
          1/2
        </div>
      </div>

      {/* 聊天侧边栏 */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[350px] glass-panel z-50 transition-transform duration-500 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 bg-orange-400 text-white flex justify-between items-center">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <i className="fas fa-paw"></i> 互动中...
            </h3>
            <button onClick={() => setIsSidebarOpen(false)} className="hover:rotate-90 transition-transform">
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
             {selectedCatId && (
               <div className="text-center mb-8">
                 <div className="w-24 h-24 rounded-full border-4 border-orange-200 mx-auto overflow-hidden shadow-lg mb-2">
                    <img 
                      src={CAT_ASSETS[cats.find(c => c.id === selectedCatId)?.type || 'ragdoll']} 
                      className="w-full h-full object-cover" 
                      alt="cat"
                    />
                 </div>
                 <h4 className="font-black text-orange-600 text-2xl">{cats.find(c => c.id === selectedCatId)?.name}</h4>
               </div>
             )}
             
             <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 text-orange-900 font-medium">
                {thought || "（猫咪正在打瞌睡...）"}
             </div>
          </div>

          <div className="p-6 border-t border-gray-100">
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="说点什么吧..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 ring-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       const val = (e.target as HTMLInputElement).value;
                       if (val) {
                         sendMessage(val).then(res => setThought(res));
                         (e.target as HTMLInputElement).value = '';
                       }
                    }
                  }}
                />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;
