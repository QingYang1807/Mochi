
import React, { useMemo } from 'react';
import { CAT_THEMES } from '../constants';

interface RealisticCatProps {
  type: keyof typeof CAT_THEMES;
  isJumping: boolean;
  isWalking: boolean;
  isSleeping?: boolean;
  scale: number;
  vx: number;
}

const RealisticCat: React.FC<RealisticCatProps> = ({ type, isJumping, isWalking, isSleeping = false, scale, vx }) => {
  const theme = CAT_THEMES[type];
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // Sleep posture adjustments
  const rotateY = isSleeping ? 0 : vx * 180; 
  const rotateX = isJumping ? -15 : (isWalking ? 5 : (isSleeping ? 10 : 0));
  const headYOffset = isSleeping ? 15 : 0; // Lower head when sleeping
  const bodyScaleY = isSleeping ? 0.85 : 1; // Compress body when sleeping

  const layerBase = "absolute inset-0 flex items-center justify-center pointer-events-none";

  const SharedDefs = () => (
    <defs>
      <radialGradient id={`gradBody-${id}`} cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor={theme.body} />
        <stop offset="100%" stopColor={theme.shade} />
      </radialGradient>
      <filter id={`shadow-${id}`}>
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
      </filter>
    </defs>
  );

  return (
    <div 
      className="relative w-48 h-48" 
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Floating Zzz particles */}
      {isSleeping && (
        <div className="absolute top-0 right-4 z-[100] pointer-events-none">
           <div className="animate-zzz-1 text-indigo-400 font-bold text-2xl absolute">Z</div>
           <div className="animate-zzz-2 text-indigo-300 font-bold text-xl absolute ml-4 mt-4">z</div>
           <div className="animate-zzz-3 text-indigo-200 font-bold text-lg absolute ml-8 mt-8">z</div>
        </div>
      )}

      <div 
        className={`relative w-full h-full transition-all duration-700 ease-in-out ${isWalking ? 'walking-anim' : ''}`}
        style={{ 
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scaleY(${bodyScaleY})`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* --- 1. Background Layer (Tail, back ears) --- */}
        <div className={layerBase} style={{ transform: 'translateZ(-20px)' }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <SharedDefs />
            <path 
              d="M130,160 Q180,160 170,90 Q160,40 130,70" 
              fill="none" 
              stroke={theme.shade} 
              strokeWidth="16" 
              strokeLinecap="round"
              className={isSleeping ? "tail-sleep" : "tail-wiggle"}
            />
            <path d="M70,75 L82,25 L102,70 Z" fill={theme.shade} />
            <path d="M130,75 L118,25 L98,70 Z" fill={theme.shade} />
          </svg>
        </div>

        {/* --- 2. Body Layer (Torso) --- */}
        <div className={layerBase} style={{ transform: 'translateZ(0px)' }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <SharedDefs />
            <path 
              d="M55,140 Q55,100 100,100 Q145,100 145,140 Q145,190 100,190 Q55,190 55,140" 
              fill={`url(#gradBody-${id})`}
              className={isSleeping ? "breathing-sleep" : "breathing"}
            />
            <ellipse cx="80" cy="188" rx="12" ry="8" fill={theme.shade} />
            <ellipse cx="120" cy="188" rx="12" ry="8" fill={theme.shade} />
          </svg>
        </div>

        {/* --- 3. Head Layer --- */}
        <div className={layerBase} style={{ transform: `translateZ(25px) translateY(${headYOffset}px) translateX(${isSleeping ? 0 : vx * 30}px)` }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <SharedDefs />
            <g filter={`url(#shadow-${id})`}>
              <circle cx="100" cy="90" r="42" fill={`url(#gradBody-${id})`} />
              <path d="M72,70 L85,35 L100,65 Z" fill={theme.body} />
              <path d="M128,70 L115,35 L100,65 Z" fill={theme.body} />
            </g>
          </svg>
        </div>

        {/* --- 4. Features Layer (Eyes, nose, mouth) --- */}
        <div className={layerBase} style={{ transform: `translateZ(45px) translateY(${headYOffset}px) translateX(${isSleeping ? 0 : vx * 65}px)` }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <SharedDefs />
            <g transform="translate(100, 90)">
              {isSleeping ? (
                /* Closed Eyes for Sleep */
                <g stroke={theme.accents} strokeWidth="2.5" fill="none" opacity="0.6">
                   <path d="M-25,-5 Q-18,2 -11,-5" />
                   <path d="M11,-5 Q18,2 25,-5" />
                </g>
              ) : (
                /* Animated Open Eyes */
                <g className="blink-anim">
                  <circle cx="-18" cy="-5" r="7" fill={theme.eyes} />
                  <circle cx="18" cy="-5" r="7" fill={theme.eyes} />
                  <ellipse cx="-18" cy="-5" rx="1.5" ry="4" fill="black" />
                  <ellipse cx="18" cy="-5" rx="1.5" ry="4" fill="black" />
                  <circle cx="-20" cy="-7" r="2" fill="white" opacity="0.8" />
                  <circle cx="16" cy="-7" r="2" fill="white" opacity="0.8" />
                </g>
              )}

              <g transform="translate(0, 15)">
                <circle cx="-9" cy="0" r="11" fill={theme.body} />
                <circle cx="9" cy="0" r="11" fill={theme.body} />
                <path d="M-3,-4 L3,-4 L0,1 Z" fill={theme.nose} />
                <path d="M-6,3 Q0,8 6,3" fill="none" stroke={theme.accents} strokeWidth="1" opacity="0.5" />
                <g stroke={theme.accents} strokeWidth="0.5" opacity="0.3">
                  <line x1="-12" y1="-2" x2="-40" y2="-10" />
                  <line x1="-12" y1="3" x2="-40" y2="8" />
                  <line x1="12" y1="-2" x2="40" y2="-10" />
                  <line x1="12" y1="3" x2="40" y2="8" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <style>{`
        .walking-anim {
          animation: walk-bounce 0.5s ease-in-out infinite;
        }
        @keyframes walk-bounce {
          0%, 100% { transform: translateY(0) rotateX(0deg); }
          50% { transform: translateY(-10px) rotateX(8deg); }
        }
        .breathing {
          animation: breathe-scale 3s ease-in-out infinite;
          transform-origin: center;
        }
        .breathing-sleep {
          animation: breathe-scale 6s ease-in-out infinite;
          transform-origin: center 140px;
        }
        @keyframes breathe-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03, 0.97); }
        }
        .tail-wiggle {
          animation: tail-sway 4s ease-in-out infinite;
          transform-origin: 130px 160px;
        }
        .tail-sleep {
          animation: tail-sway 10s ease-in-out infinite;
          transform-origin: 130px 160px;
          opacity: 0.7;
        }
        @keyframes tail-sway {
          0%, 100% { transform: rotateY(-10deg) rotateZ(-5deg); }
          50% { transform: rotateY(20deg) rotateZ(10deg); }
        }
        .blink-anim {
          animation: cat-blink 6s infinite;
          transform-origin: center -5px;
        }
        @keyframes cat-blink {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }
        .animate-zzz-1 { animation: zzz-float 4s linear infinite; opacity: 0; }
        .animate-zzz-2 { animation: zzz-float 4s linear infinite 1.3s; opacity: 0; }
        .animate-zzz-3 { animation: zzz-float 4s linear infinite 2.6s; opacity: 0; }
        @keyframes zzz-float {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translate(40px, -80px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RealisticCat;
