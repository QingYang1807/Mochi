
export enum CatMood {
  HAPPY = 'HAPPY',
  SLEEPY = 'SLEEPY',
  HUNGRY = 'HUNGRY',
  PLAYFUL = 'PLAYFUL',
  // Added SAD to fix error in CatSprite.tsx
  SAD = 'SAD'
}

// Added CatStats to fix error in StatusBar.tsx
export interface CatStats {
  hunger: number;
  happiness: number;
  energy: number;
}

export interface CatInstance {
  id: string;
  type: 'ragdoll' | 'british' | 'calico' | 'tuxedo';
  x: number;
  y: number;
  scale: number;
  name: string;
}

export interface GardenState {
  cats: CatInstance[];
  unlockProgress: number;
  timeLeft: number;
  isZoomed: boolean;
}