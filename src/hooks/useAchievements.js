import * as LucideIcons from 'lucide-react';

export function useAchievements(gameConfig) {
  return gameConfig.achievements.map(a => ({
    ...a,
    icon: (() => {
      const IconComp = LucideIcons[a.icon] || LucideIcons['FileQuestion'];
      return <IconComp size={32} color={a.color || '#888'} />;
    })(),
  }));
}
