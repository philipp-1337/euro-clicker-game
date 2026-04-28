import { Hammer, Landmark, Euro, Star, Factory } from 'lucide-react';

const baseTabs = [
	{ key: 'basic', label: 'Basic', icon: <Euro size={26} /> },
	{ key: 'premium', label: 'Premium', icon: <Star size={26} /> },
	{ key: 'investments', label: 'Invest', icon: <Landmark size={26} /> },
	{ key: 'crafting', label: 'Crafting', icon: <Hammer size={26} /> },
];

export default function BottomTabMenu({ activeTab, setActiveTab, prestigeCount }) {
	const isProductionHQUnlocked = prestigeCount > 0;

	const tabs = [...baseTabs];
	if (isProductionHQUnlocked) {
		tabs.push({ key: 'production_hq', label: 'Prod. HQ', icon: <Factory size={26} /> });
	}

	return (
		<nav className="bottom-tab-menu">
			{tabs.map(tab => (
				<button
					key={tab.key}
					className={`bottom-tab-btn ${tab.key}${
						activeTab === tab.key ? ' active' : ''
					}`}
					onClick={() => setActiveTab(tab.key)}
				>
					<div className="bottom-tab-icon">{tab.icon}</div>
					<span className="bottom-tab-label">{tab.label}</span>
				</button>
			))}
		</nav>
	);
}
