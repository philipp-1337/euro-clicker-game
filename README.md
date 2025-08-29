# Euro Clicker Game

A modern and feature-rich idle-clicker game built with React. Earn virtual money, automate your income, invest in companies, and climb the leaderboards.

## Description

Euro Clicker Game is an idle/incremental game inspired by classics like "Cookie Clicker" and "Adventure Capitalist," but with a modern feature set and a European money theme.

### Core Features

- **Click & Earn**: Start by clicking and unlock more valuable sources of income.
- **Managers**: Hire managers to automate your clicks and generate passive income.
- **Upgrades**:
  - **Basic Upgrades**: Increase the value and reduce the cooldown of your clicks.
  - **Premium Upgrades**: Unlock powerful global boosts like critical clicks, offline earnings, cost reductions, and more.
- **Investments**: Purchase shares in various companies to build a steady, long-term passive income stream.
- **Wealth Production (Crafting)**: After prestiging, unlock the ability to buy raw materials and craft high-value items for massive payouts.
- **Auto-Buyers**: Automate the purchasing of upgrades to streamline your progress.
- **Prestige System**: Reset your progress to earn "Prestige Shares," which provide a permanent boost to your income, allowing for faster progression in subsequent runs.
- **Cloud Saving**: Securely save and load your progress across devices using Firebase.
- **Leaderboards**: Compete with other players and submit your high scores for various milestones.
- **Achievements**: Unlock achievements for reaching specific goals and milestones.
- **Modern UI/UX**: Enjoy a clean, responsive interface with dark mode, sound effects, and background music.

## Installation

- Make sure Node.js and npm are installed on your system.
- Clone this repository.
- Navigate to the project directory and install the dependencies:

    ```bash
    npm install
    ```

- Start the application:

    ```bash
    npm start
    ```

- Open [http://localhost:3000](http://localhost:3000) in your browser to play.

## Technologies Used

- React.js (with React Hooks)
- SCSS for styling
- Firebase for Cloud Firestore (leaderboards, cloud saves)
- Lucide React for icons

## Project Structure

The project follows a component-based architecture with a clear separation of concerns.

```bash
/src
  /components     # React components for UI elements (Modals, Buttons, etc.)
  /hooks          # Custom hooks containing the core game logic for each feature
  /constants      # Central game configuration (upgrades, costs, achievements)
  /scss           # Global styles, variables, and mixins
  /utils          # Helper functions
  firebase.js     # Firebase initialization
  App.js          # Main application component
```

## How to Play

1. **Start Earning**: Click the floating Euro button to generate your first income.
2. **Unlock & Upgrade**: As you earn more, new click buttons and upgrade tabs will become available.
    - Invest in **Basic Upgrades** to increase the value of each button and reduce its cooldown.
    - Hire **Managers** to automate the clicking process.
3. **Expand Your Empire**:
    - Unlock the **Investments** tab to buy shares in companies for a steady passive income.
    - Purchase **Premium Upgrades** for powerful, game-changing boosts.
4. **Prestige for Power**: Once you reach 1 Billion €, you can **Prestige**. This resets your game but grants you permanent income bonuses, making each new run faster and more profitable.
5. **Advanced Mechanics**:
    - After your first prestige, unlock **Wealth Production** to craft valuable items.
    - Unlock **Auto-Buyers** from the premium upgrades to automate your upgrade strategy.
6. **Compete**: Submit your score to the **Leaderboard** and unlock **Achievements** as you progress.
