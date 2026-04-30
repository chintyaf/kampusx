import { Zap } from 'lucide-react';

export default function TechTag({ label }) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 5,
				fontSize: 11,
				fontWeight: 500,
				background: '#ede7f6',
				color: '#4527a0',
				border: '0.5px solid #b39ddb',
				borderRadius: 20,
				padding: '3px 10px',
			}}>
			<Zap size={10} />
			{label}
		</span>
	);
}
