import { Hammer, Landmark, Euro, Star } from 'lucide-react';

const tabs = [
	{ key: 'basic', label: 'Basic', icon: <Euro size={26} /> },
	{ key: 'premium', label: 'Premium', icon: <Star size={26} /> },
	{ key: 'investments', label: 'Investments', icon: <Landmark size={26} /> },
	{ key: 'crafting', label: 'Crafting', icon: <Hammer size={26} /> },
];

export default function BottomTabMenu({ activeTab, setActiveTab }) {
	return (
		<nav className="bottom-tab-menu">
			{tabs.map(tab => (
				<button
					key={tab.key}
					className={`bottom-tab-btn${
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
