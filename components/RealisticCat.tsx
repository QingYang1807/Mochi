
import React, { useMemo } from 'react';
import { CAT_THEMES } from '../constants';

interface RealisticCatProps {
  type: keyof typeof CAT_THEMES;
  isJumping: boolean;
  isWalking: boolean;
  scale: number;
}

const RealisticCat: React.FC<RealisticCatProps> = ({ type, isJumping, isWalking, scale }) => {
  const theme = CAT_THEMES[type];
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), [type]);

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 200 220" 
        className={`w-32 h-32 md:w-44 md:h-44 transition-all duration-700 ${isWalking ? 'walking-cycle' : ''}`}
      >
        <defs>
          {/* 身体 3D 渐变 */}
          <radialGradient id={`bodyGrad-${id}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={theme.body} />
            <stop offset="100%" stopColor={theme.shade} />
          </radialGradient>
          
          {/* 头部 3D 渐变 */}
          <radialGradient id={`headGrad-${id}`} cx="45%" cy="35%" r="55%">
            <stop offset="0%" stopColor={theme.body} />
            <stop offset="100%" stopColor={theme.shade} />
          </radialGradient>

          {/* 眼睛晶体渐变 */}
          <radialGradient id={`eyeGrad-${id}`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="30%" stopColor={theme.eyes} />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>

          {/* 阴影滤镜 */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 尾巴 - 增加锥度效果 */}
        <g className="tail-container">
          <path 
            d="M130,160 Q180,160 170,100 Q165,60 145,80" 
            fill="none" 
            stroke={`url(#bodyGrad-${id})`} 
            strokeWidth="14" 
            strokeLinecap="round"
            className="tail-animate"
          />
        </g>

        {/* 身体 - 更复杂的躯干形状 */}
        <path 
          d="M60,140 Q60,110 100,110 Q140,110 140,140 Q140,190 100,190 Q60,190 60,140" 
          fill={`url(#bodyGrad-${id})`} 
          className="body-pulse"
        />

        {/* 特殊花纹细节 */}
        {theme.pattern === 'tuxedo' && (
           <path d="M85,130 Q100,160 115,130 L100,115 Z" fill="white" opacity="0.9" />
        )}
        {theme.pattern === 'mask' && (
           <ellipse cx="100" cy="105" rx="30" ry="25" fill={theme.accents} opacity="0.25" />
        )}

        {/* 前肢 */}
        <g className={isWalking ? 'legs-walk' : ''}>
          <ellipse cx="80" cy="185" rx="10" ry="6" fill={theme.body} />
          <ellipse cx="120" cy="185" rx="10" ry="6" fill={theme.body} />
        </g>

        {/* 头部 - 腮帮子隆起路径 */}
        <g className="head-group">
          <path 
            d="M65,95 Q65,65 100,65 Q135,65 135,95 Q135,125 100,130 Q65,125 65,95" 
            fill={`url(#headGrad-${id})`} 
            filter="url(#softShadow)"
          />
          
          {/* 耳朵 - 内部层次感 */}
          <g className="ear-twitch-group">
            <path d="M70,75 L82,35 L100,70 Z" fill={theme.body} />
            <path d="M76,68 L84,45 L94,65 Z" fill="#FDA4AF" opacity="0.3" /> {/* 内耳 */}
            
            <path d="M130,75 L118,35 L100,70 Z" fill={theme.body} />
            <path d="M124,68 L116,45 L106,65 Z" fill="#FDA4AF" opacity="0.3" />
          </g>

          {/* 眼睛 - 深度晶体感 */}
          <g className="eye-blink-layer">
            <circle cx="85" cy="95" r="7" fill={`url(#eyeGrad-${id})`} />
            <circle cx="115" cy="95" r="7" fill={`url(#eyeGrad-${id})`} />
            <rect x="84" y="92" width="2" height="6" rx="1" fill="black" /> {/* 瞳孔 */}
            <rect x="114" y="92" width="2" height="6" rx="1" fill="black" />
            <circle cx="83" cy="93" r="1.5" fill="white" opacity="0.8" /> {/* 反光 */}
            <circle cx="113" cy="93" r="1.5" fill="white" opacity="0.8" />
          </g>

          {/* 吻部（胡须垫）- 关键立体点 */}
          <g transform="translate(100, 112)">
            <ellipse cx="-8" cy="0" rx="10" ry="8" fill={theme.body} opacity="0.5" />
            <ellipse cx="8" cy="0" rx="10" ry="8" fill={theme.body} opacity="0.5" />
            <path d="M-3,-4 L3,-4 L0,0 Z" fill={theme.nose} />
            {/* 胡须 */}
            <g stroke={theme.accents} strokeWidth="0.3" opacity="0.3">
              <line x1="-15" y1="-2" x2="-45" y2="-8" />
              <line x1="-15" y1="2" x2="-45" y2="5" />
              <line x1="15" y1="-2" x2="45" y2="-8" />
              <line x1="15" y1="2" x2="45" y2="5" />
            </g>
          </g>
        </g>
      </svg>

      <style>{`
        .tail-animate {
          animation: tail-flow 4s ease-in-out infinite;
          transform-origin: 130px 160px;
        }
        @keyframes tail-flow {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(15deg) scale(1.05); }
        }
        .body-pulse {
          animation: body-breathe 3s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes body-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02, 0.99); }
        }
        .head-group {
          animation: head-sway 6s ease-in-out infinite;
          transform-origin: center 130px;
        }
        @keyframes head-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .eye-blink-layer {
          animation: real-blink 5s infinite;
          transform-origin: center 95px;
        }
        @keyframes real-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.05); }
        }
        .ear-twitch-group {
          animation: ear-move 8s infinite;
        }
        @keyframes ear-move {
          0%, 95% { transform: rotate(0); }
          97% { transform: rotate(-3deg); }
          99% { transform: rotate(3deg); }
        }
        .walking-cycle {
          animation: cat-walk-bob 0.4s ease-in-out infinite;
        }
        @keyframes cat-walk-bob {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
};

export default RealisticCat;
