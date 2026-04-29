import { useCallback, useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';
import useSoundEffects from './useSoundEffects'; // Import the new hook

export default function useCooldowns(cooldowns, setCooldowns, managers, buttons, money, setMoney, soundEffectsEnabled, enabled = true) {
  const { playSound } = useSoundEffects(soundEffectsEnabled); // Use the sound effects hook

  const handleClick = useCallback((index, isManager = false) => {
    if (!enabled) {
      return;
    }

    if (cooldowns[index] <= 0) {
      // Nur bei manuellen Klicks Geld addieren!
      if (!isManager) {
        setMoney(prevMoney => prevMoney + buttons[index].value);
      }
      setCooldowns(prevCooldowns => {
        const newCooldowns = [...prevCooldowns];
        newCooldowns[index] = buttons[index].cooldownTime;
        return newCooldowns;
      });
      playSound('click'); // Play the click sound
    }
  }, [cooldowns, buttons, enabled, setMoney, setCooldowns, playSound]);

  // Cooldown-Timer
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCooldowns(prevCooldowns => 
        prevCooldowns.map((cooldown, index) => {
          const newCooldown = cooldown > 0 ? cooldown - 0.1 : 0;
          // Wenn Manager existiert und Cooldown gerade fertig ist, Auto-Click auslösen
          if (managers[index] && cooldown > 0 && newCooldown <= 0) {
            setTimeout(() => handleClick(index, true), 0); // isManager = true
          }
          return newCooldown;
        })
      );
    }, gameConfig.timing.updateInterval);

    return () => clearInterval(interval);
  }, [enabled, managers, buttons, handleClick, setCooldowns]);

  // Manager Auto-Clicking
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const autoClickInterval = setInterval(() => {
      managers.forEach((hasManager, index) => {
        if (hasManager && cooldowns[index] <= 0) {
          handleClick(index, true); // isManager = true
        }
      });
    }, gameConfig.timing.updateInterval);

    return () => clearInterval(autoClickInterval);
  }, [enabled, managers, cooldowns, buttons, handleClick]);

  return { handleClick };
}
