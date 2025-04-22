export default function useManagers(money, setMoney, managers, setManagers, ensureStartTime) {
  function buyManager(index, cost) {
    if (money >= cost && !managers[index]) {
      ensureStartTime?.();
      setMoney(prevMoney => prevMoney - cost);
      setManagers(prevManagers => {
        const newManagers = [...prevManagers];
        newManagers[index] = true;
        return newManagers;
      });
    }
  }

  return { buyManager };
}