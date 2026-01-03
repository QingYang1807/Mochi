
import React, { useEffect } from 'react';
import { CatInstance } from '../types';
import RealisticCat from './RealisticCat';

interface CatItemProps {
  cat: CatInstance;
  vx: number;
  isJumping: boolean;
  onJumpEnd: () => void;
  onClick: (id: string) => void;
  thought?: string | null;
}

const CatItem: React.FC<CatItemProps> = ({ cat, vx, isJumping, onJumpEnd, onClick, thought }) => {
  
  useEffect(() => {
    if (isJumping) {
      const timer = setTimeout(() => {
        onJumpEnd();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isJumping, onJumpEnd]);

  const isFlipped = vx < 0;
  const isWalking = Math.abs(vx) > 0.01;

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
        <div 
          className={`relative transition-transform duration-500 ${isJumping ? 'animate-cat-jump' : ''}`}
          style={{ transform: `scale(${isFlipped ? -cat.scale : cat.scale}, ${cat.scale})` }}
        >
          {/* 使用全新骨骼动画组件 */}
          <RealisticCat 
            type={cat.type} 
            isJumping={isJumping} 
            isWalking={isWalking}
            scale={cat.scale}
          />
        </div>
        
        {/* 动态阴影 */}
        <div className={`w-12 h-1.5 bg-black/15 blur-sm rounded-full -mt-2 transition-all duration-500 ${isJumping ? 'scale-50 opacity-10' : 'scale-100 opacity-40'}`}></div>

        {/* 名字显示 */}
        <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
           {cat.name}
        </div>
      </div>

      <style>{`
        @keyframes cat-jump {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          10% { transform: translateY(0) scale(1.1, 0.9); }
          40% { transform: translateY(-70px) scale(0.9, 1.1); }
          90% { transform: translateY(0) scale(1.05, 0.95); }
        }
        .animate-cat-jump {
          animation: cat-jump 0.7s cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
      `}</style>
    </div>
  );
};

export default CatItem;
