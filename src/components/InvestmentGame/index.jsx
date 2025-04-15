import GameHeader from '@components/shared/GameHeader';
// import Tabs etc.

export default function InvestmentGame({ easyMode, onEasyModeToggle }) {
  // eigene States z.B. money, playTime etc.

  return (
    <>
      <GameHeader
        money={0} // später dynamisch
        playTime={0} // später dynamisch
        easyMode={easyMode}
        onEasyModeToggle={onEasyModeToggle}
        onSaveGame={() => {}}
      />
      {/* weitere Komponenten */}
    </>
  );
}