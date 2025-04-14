# Euro Clicker Game

A fun idle-clicker game built with React. Earn virtual money by clicking, buy managers to generate automatic clicks, and improve your money sources through upgrades.

## Description

Euro Clicker Game is an idle game in the style of "Cookie Clicker" or "Adventure Capitalist," but with a European money theme. The game features:

- Different colored click buttons with varying values
- Cooldown timers for each button
- Managers to automate clicks
- Two types of upgrades:
  - Value upgrades (increase the amount of money per click)
  - Time upgrades (reduce cooldown time)
- Simple and intuitive user interface

## Installation

- Make sure Node.js and npm are installed on your system
- Clone this repository or download it
- Navigate to the project directory in your terminal
- Install the dependencies:

```bash
npm install
```

- *Start the application:

```bash
npm start
```

- Open [http://localhost:3000](http://localhost:3000) in your browser to play the game

## Technologies Used

- React.js
- React Hooks (useState, useEffect)
- CSS
- Lucide React (for icons)

## Folder- & File-Structure

```bash
/src
  /components
    /ClickerGame
      /index.jsx              # Hauptkomponente, exportiert ClickerGame
      /GameHeader.jsx         # Titel und Geldanzeige
      /ClickerButtons.jsx     # Die Haupt-Click-Buttons
      /Managers.jsx           # Manager-Sektion
      /UpgradeTabs
        /index.jsx            # Tab-Container
        /BasicUpgrades.jsx    # Erster Tab
        /PremiumUpgrades.jsx  # Zweiter Tab
  /hooks
    /useClickerGame.js        # Hauptlogik als Hook extrahiert
    /useOfflineEarnings.js    # Logik für Offline-Earnings
    /useAutoClicker.js        # Logik für den Auto-Clicker
  /utils
    /calculators.js           # Hilfsfunktionen für Berechnungen
    /localStorage.js          # Funktionen für LocalStorage-Verwaltung
  /constants
    /gameConfig.js            # Spielkonfiguration (Kosten, Multiplikatoren, etc.)
```

## How to Play

1. **Basic Principle**: Click on the buttons to earn money. Each button has its own value and cooldown time.

2. **Managers**: Once you have enough money, you can buy managers who will automatically click for you. Each manager is associated with a specific button.

3. **Upgrades**:
   - **Value Upgrades**: Increase the money value of the respective button by 10%
   - **Time Upgrades**: Reduce the cooldown time of the respective button by 10%

4. **Strategy**: Decide wisely when to invest in managers or upgrades to maximize your money growth!

## Customization

You can easily customize the game by changing the values and prices in the code:

- Modify the base values and cooldown times in the `baseButtons` array
- Adjust the manager and upgrade costs
- Add more button types or change their colors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

If you encounter any issues:

1. Make sure you're using the latest version of Node.js and npm
2. Verify that all dependencies were properly installed
3. Delete the `node_modules` folder and run `npm install` again
4. If there are display problems, clear your browser cache

## Future Features

- Save game progress in local storage
- Offline progress
- Prestige system
- Achievements
- Additional types of upgrades

## Contributing

Contributions are welcome! Feel free to report bugs or create pull requests.
