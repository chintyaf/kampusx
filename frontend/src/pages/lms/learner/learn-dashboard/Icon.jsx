import React from 'react';
import {
	Play,
	ArrowRight,
	Check,
	Clock,
	Target,
	Flame,
	Award,
	CheckCircle,
	AlertCircle,
	ChevronDown,
	BookOpen,
	Lightbulb,
	TrendingUp,
	Briefcase,
	ShieldCheck,
	Calendar,
	Zap,
	Activity,
	RefreshCw,
	Lock,
	Layers,
	Link,
} from 'lucide-react';

// Pemetaan nama ikon yang dipakai komponen dashboard → komponen lucide-react.
const ICONS = {
	play: Play,
	'arrow-right': ArrowRight,
	check: Check,
	clock: Clock,
	target: Target,
	flame: Flame,
	award: Award,
	'check-circle': CheckCircle,
	alert: AlertCircle,
	'chevron-down': ChevronDown,
	'book-open': BookOpen,
	lightbulb: Lightbulb,
	'trending-up': TrendingUp,
	briefcase: Briefcase,
	shield: ShieldCheck,
	calendar: Calendar,
	zap: Zap,
	activity: Activity,
	refresh: RefreshCw,
	lock: Lock,
	layers: Layers,
	link: Link,
};

const Icon = ({ name, size = 16, className = '', strokeWidth = 2 }) => {
	const LucideIcon = ICONS[name];
	if (!LucideIcon) return null;
	return (
		<LucideIcon
			className={`ld-icon ${className}`.trim()}
			size={size}
			strokeWidth={strokeWidth}
			aria-hidden="true"
		/>
	);
};

export default Icon;
