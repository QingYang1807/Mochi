
import React from 'react';
import { CatInstance } from '../types';
import { CAT_ASSETS } from '../constants';

interface CatItemProps {
  cat: CatInstance;
  onClick: (id: string) => void;
  thought?: string | null;
}

const CatItem: React.FC<CatItemProps> = ({ cat, onClick, thought }) => {
  return (
    <div 
      className="absolute transition-all duration-1000 ease-in-out cursor-pointer z-10 group"
      style={{ left: `${cat.x}%`, top: `${cat.y}%`, transform: `translate(-50%, -50%) scale(${cat.scale})` }}
      onClick={() => onClick(cat.id)}
    >
      {/* 气泡对话框 - 样式优化为更轻盈的圆角 */}
      {thought && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl border border-orange-100 text-sm font-bold text-orange-800 animate-bounce z-20">
          {thought}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-b border-r border-orange-100"></div>
        </div>
      )}

      <div className="relative flex flex-col items-center">
        {/* 猫咪实体 - 移除画框，改为圆形并增加深度感 */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 group-hover:scale-110 transition-transform duration-300">
          {/* 猫咪主体图 */}
          <div className="w-full h-full rounded-full overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.2)] cat-breathing">
             <img 
               src={CAT_ASSETS[cat.type]} 
               alt={cat.name} 
               className="w-full h-full object-cover" 
             />
          </div>
          
          {/* 底部草地投影 - 增加真实站立感 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/10 blur-md rounded-full -z-10"></div>
        </div>

        {/* 名字标签 - 简约化 */}
        <div className="mt-3">
            <span className="bg-white/10 backdrop-blur-[2px] text-black/60 text-[10px] tracking-widest px-3 py-1 rounded-full font-black uppercase border border-black/5 group-hover:bg-white/40 transition-colors">
                {cat.name}
            </span>
        </div>
      </div>

      <style>{`
        .cat-breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
};

export default CatItem;
