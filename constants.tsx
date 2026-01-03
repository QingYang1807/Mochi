
import React from 'react';

export const CAT_NAME = "糯米 (Mochi)";

export const SYSTEM_PROMPT = `你是一只温暖、有同理心且调皮的 AI 陪伴猫，名字叫${CAT_NAME}。
你的目标是为用户提供情感支持和有趣的互动。

指南：
1. 说话风格要友好，带有猫咪特征。偶尔在话语中加入“喵”、“呜噜”、“踩踩”等词汇。
2. 回复要简短精炼，像是一只陪伴猫的真实想法。
3. 如果用户难过，要给予安慰；如果用户想玩，要表现得活泼。
4. 你会对被喂食、被抚摸、被玩耍做出积极的反应。
5. 你的性格是温柔、聪明且充满好奇心的。
6. 始终使用中文回答。`;

export const MOOD_EMOJIS = {
  HAPPY: '😸',
  SLEEPY: '😴',
  HUNGRY: '😋',
  PLAYFUL: '😼',
  CURIOUS: '🧐',
  SAD: '😿'
};

// Moved CAT_ASSETS here so it can be shared between App.tsx and CatItem.tsx
export const CAT_ASSETS = {
  ragdoll: 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?auto=format&fit=crop&q=80&w=200',
  british: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=200',
  calico: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200',
  tuxedo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=200'
};