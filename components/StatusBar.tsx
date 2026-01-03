
import React from 'react';
import { CatStats } from '../types';

interface StatusBarProps {
  stats: CatStats;
}

const StatusBar: React.FC<StatusBarProps> = ({ stats }) => {
  const StatItem = ({ label, value, icon, colorClass }: { label: string, value: number, icon: string, colorClass: string }) => (
    <div className="flex flex-col gap-1 flex-1">
      <div className="flex justify-between items-center text-sm font-bold text-orange-900 px-1">
        <span><i className={`${icon} mr-1`}></i> {label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-3 w-full bg-orange-100 rounded-full overflow-hidden border border-orange-200">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm">
      <StatItem label="饥饿度" value={stats.hunger} icon="fas fa-fish" colorClass="bg-red-400" />
      <StatItem label="心情值" value={stats.happiness} icon="fas fa-heart" colorClass="bg-pink-400" />
      <StatItem label="体力值" value={stats.energy} icon="fas fa-bolt" colorClass="bg-yellow-400" />
    </div>
  );
};

export default StatusBar;
