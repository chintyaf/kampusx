import React from 'react';
import './SegmentedTabs.css';

const SegmentedTabs = ({ tabs, activeTab, onChange }) => {
	return (
		<div className="segmented-tabs-wrapper">
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id;
				const Icon = tab.icon;

				return (
					<button
						key={tab.id}
						onClick={() => onChange(tab.id)}
						className={`segmented-tab-btn ${isActive ? 'active' : ''}`}>
						{Icon && <Icon size={18} className="tab-icon" />}
						<span className="tab-label">{tab.label}</span>

						{/* Render Badge jika data badge tersedia */}
						{tab.badge && <span className="tab-badge">{tab.badge}</span>}
					</button>
				);
			})}
		</div>
	);
};

export default SegmentedTabs;
