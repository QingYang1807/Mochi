
import React, { useEffect, useState } from 'react';
import { CatInstance } from '../types';
import { CAT_ASSETS } from '../constants';

interface CatItemProps {
  cat: CatInstance;
  vx: number;
  isJumping: boolean;
  onJumpEnd: () => void;
  onClick: (id: string) => void;
  thought?: string | null;
}

const CatItem: React.FC<CatItemProps> = ({ cat, vx, isJumping, onJumpEnd, onClick, thought }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    if (isJumping) {
      const timer = setTimeout(() => {
        onJumpEnd();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isJumping, onJumpEnd]);

  const isFlipped = vx < 0;

  return (
    <div 
      className="absolute transition-all duration-300 ease-linear cursor-pointer"
      style={{ 
        left: `${cat.x}%`, 
        top: `${cat.y}%`, 
        transform: `translate(-50%, -50%)`,
        zIndex: Math.floor(cat.y),
      }}
      onClick={() => onClick(cat.id)}
    >
      {/* 气泡对话 */}
      {thought && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-2xl shadow-xl border border-orange-200 text-xs font-bold text-orange-800 animate-bounce z-[60]">
          {thought}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-orange-200"></div>
        </div>
      )}

      <div className="relative flex flex-col items-center group">
        {/* 猫咪主体 */}
        <div 
          className={`relative transition-transform duration-500 ${isJumping ? 'animate-cat-jump' : ''}`}
          style={{ transform: `scale(${isFlipped ? -cat.scale : cat.scale}, ${cat.scale})` }}
        >
          {hasError ? (
            <div className="w-20 h-20 md:w-24 bg-white/80 backdrop-blur-sm rounded-full flex flex-col items-center justify-center border-4 border-orange-200 shadow-inner">
               <span className="text-4xl">🐱</span>
               <span className="text-[8px] font-bold text-orange-400 mt-1">{cat.name}</span>
            </div>
          ) : (
            <img 
              src={CAT_ASSETS[cat.type]} 
              alt={cat.name} 
              onError={() => setHasError(true)}
              className="w-24 h-auto md:w-32 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] cat-idle-float select-none pointer-events-none"
            />
          )}
        </div>
        
        {/* 动态阴影 */}
        <div className={`w-12 h-1.5 bg-black/15 blur-sm rounded-full -mt-1 transition-all duration-500 ${isJumping ? 'scale-50 opacity-10' : 'scale-100 opacity-40'}`}></div>

        {/* 名字显示 - 悬停显示 */}
        <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
           {cat.name}
        </div>
      </div>

      <style>{`
        @keyframes cat-jump {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          10% { transform: translateY(0) scale(1.1, 0.9); }
          40% { transform: translateY(-60px) scale(0.9, 1.1); }
          60% { transform: translateY(-60px) scale(0.95, 1.05); }
          90% { transform: translateY(0) scale(1.05, 0.95); }
        }
        .animate-cat-jump {
          animation: cat-jump 0.7s cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
        .cat-idle-float {
          animation: idle-float 4s ease-in-out infinite;
        }
        @keyframes idle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(1deg); }
          75% { transform: translateY(-2px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default CatItem;
