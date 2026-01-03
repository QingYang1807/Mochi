
export const CAT_NAME = "糯米 (Mochi)";

export const SYSTEM_PROMPT = `你是一只温暖、有同理心且调皮的 AI 陪伴猫，名字叫${CAT_NAME}。
你的目标是为用户提供情感支持和有趣的互动。用中文回答。`;

// 升级后的 3D 颜色方案
export const CAT_THEMES = {
  ragdoll: {
    body: '#FFF7ED', // 奶油
    shade: '#FFEDD5', // 阴影
    accents: '#78350F', // 面具咖
    eyes: '#60A5FA', // 冰蓝
    nose: '#FDA4AF',
    pattern: 'mask'
  },
  british: {
    body: '#94A3B8', // 蓝猫灰
    shade: '#64748B', 
    accents: '#475569',
    eyes: '#F59E0B', // 琥珀
    nose: '#E11D48',
    pattern: 'solid'
  },
  calico: {
    body: '#FDBA74', // 橘
    shade: '#F97316',
    accents: '#44403C', // 玳瑁黑
    eyes: '#10B981', // 祖母绿
    nose: '#FB7185',
    pattern: 'spots'
  },
  tuxedo: {
    body: '#1F2937', // 礼服黑
    shade: '#111827',
    accents: '#F9FAFB', // 纯白
    eyes: '#FACC15', // 金眼
    nose: '#FB7185',
    pattern: 'tuxedo'
  }
};
