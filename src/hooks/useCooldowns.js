import { useCallback, useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';

export default function useCooldowns(cooldowns, setCooldowns, managers, buttons, money, setMoney) {
  const handleClick = useCallback((index) => {
    if (cooldowns[index] <= 0) {
      setMoney(prevMoney => prevMoney + buttons[index].value);
  
      setCooldowns(prevCooldowns => {
        const newCooldowns = [...prevCooldowns];
        newCooldowns[index] = buttons[index].cooldownTime;
        return newCooldowns;
      });
    }
  }, [cooldowns, buttons, setMoney, setCooldowns]);

  // Cooldown-Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prevCooldowns => 
        prevCooldowns.map((cooldown, index) => {
          // Cooldown-Zeit verringern
          const newCooldown = cooldown > 0 ? cooldown - 0.1 : 0;
          
          // Wenn Manager existiert und Cooldown gerade fertig ist, Auto-Click auslösen
          if (managers[index] && cooldown > 0 && newCooldown <= 0) {
            setTimeout(() => handleClick(index), 0);
          }
          
          return newCooldown;
        })
      );
    }, gameConfig.timing.updateInterval);

    return () => clearInterval(interval);
  }, [managers, buttons, handleClick, setCooldowns]);

  // Manager Auto-Clicking
  useEffect(() => {
    const autoClickInterval = setInterval(() => {
      managers.forEach((hasManager, index) => {
        if (hasManager && cooldowns[index] <= 0) {
          handleClick(index);
        }
      });
    }, gameConfig.timing.updateInterval);

    return () => clearInterval(autoClickInterval);
  }, [managers, cooldowns, buttons, handleClick]);

  return { handleClick };
}