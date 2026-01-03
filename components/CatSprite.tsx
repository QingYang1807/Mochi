
import React from 'react';
import { CatMood } from '../types';

interface CatSpriteProps {
  mood: CatMood;
  isInteracting: boolean;
  thought: string | null;
}

const CatSprite: React.FC<CatSpriteProps> = ({ mood, isInteracting, thought }) => {
  const isSleepy = mood === CatMood.SLEEPY;
  const isSad = mood === CatMood.SAD;
  const isHappy = mood === CatMood.HAPPY || mood === CatMood.PLAYFUL;

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      {/* 气泡对话框 */}
      {thought && (
        <div className="absolute -top-24 bg-white p-4 rounded-2xl shadow-xl border-2 border-orange-200 text-orange-800 font-bold max-w-xs animate-bounce z-20">
          {thought}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-orange-200 rotate-45"></div>
        </div>
      )}

      {/* 动画小猫 SVG */}
      <div className={`relative w-64 h-64 md:w-80 md:h-80 transition-all duration-500 ${isInteracting ? 'scale-110' : 'scale-100'}`}>
        <svg viewBox="0 0 200 200" className={`w-full h-full ${isHappy ? 'purr-effect' : 'cat-float'}`}>
          {/* 尾巴 */}
          <path 
            d="M150,150 Q180,120 160,80" 
            fill="none" 
            stroke="#FDBA74" 
            strokeWidth="12" 
            strokeLinecap="round"
            className="origin-bottom animate-[wiggle_2s_ease-in-out_infinite]"
          />
          
          {/* 身体 */}
          <rect x="50" y="100" width="100" height="80" rx="40" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="4" />
          
          {/* 耳朵 */}
          <path d="M60,60 L80,100 L40,100 Z" fill="#FDBA74" className="origin-center animate-[wiggle_3s_ease-in-out_infinite]" />
          <path d="M140,60 L120,100 L160,100 Z" fill="#FDBA74" className="origin-center animate-[wiggle_3s_ease-in-out_infinite_0.5s]" />
          
          {/* 头部 */}
          <circle cx="100" cy="90" r="50" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="4" />
          
          {/* 眼睛 */}
          {isSleepy ? (
            <>
              <path d="M75,90 Q85,100 95,90" fill="none" stroke="#9A3412" strokeWidth="3" />
              <path d="M105,90 Q115,100 125,90" fill="none" stroke="#9A3412" strokeWidth="3" />
            </>
          ) : (
            <>
              <g className="animate-[blink_4s_infinite]">
                <circle cx="80" cy="85" r={isSad ? 4 : 6} fill="#431407" />
                <circle cx="120" cy="85" r={isSad ? 4 : 6} fill="#431407" />
              </g>
            </>
          )}
          
          {/* 鼻子 */}
          <path d="M95,100 L105,100 L100,105 Z" fill="#F87171" />
          
          {/* 嘴巴 */}
          {isSad ? (
            <path d="M90,115 Q100,105 110,115" fill="none" stroke="#9A3412" strokeWidth="2" />
          ) : (
            <path d="M85,110 Q100,125 115,110" fill="none" stroke="#9A3412" strokeWidth="2" />
          )}

          {/* 胡须 */}
          <line x1="40" y1="95" x2="10" y2="90" stroke="#FDBA74" strokeWidth="2" />
          <line x1="40" y1="105" x2="10" y2="110" stroke="#FDBA74" strokeWidth="2" />
          <line x1="160" y1="95" x2="190" y2="90" stroke="#FDBA74" strokeWidth="2" />
          <line x1="160" y1="105" x2="190" y2="110" stroke="#FDBA74" strokeWidth="2" />
        </svg>

        {/* 爪子 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-12">
            <div className="w-8 h-6 bg-[#FFEDD5] rounded-full border-2 border-[#FDBA74]"></div>
            <div className="w-8 h-6 bg-[#FFEDD5] rounded-full border-2 border-[#FDBA74]"></div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default CatSprite;
