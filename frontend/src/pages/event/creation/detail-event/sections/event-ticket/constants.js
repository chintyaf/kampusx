import { MapPin, Globe, Shuffle } from 'lucide-react';

export const PLATFORM_FEE = 0.05;

export const FORMAT_OPTIONS = [
	{
		key: 'offline',
		label: 'Offline (Luring)',
		desc: 'Tiket fisik + Geofencing & QR Onsite',
		icon: MapPin,
		color: '#c2185b',
		bg: '#fce4ec',
		techTags: ['Geofencing GPS', 'Dynamic QR Onsite', 'Strict 1-to-1'],
	},
	{
		key: 'online',
		label: 'Online (Daring)',
		desc: 'Akses virtual + Zoom/Streaming otomatis',
		icon: Globe,
		color: '#00796b',
		bg: '#e0f2f1',
		techTags: ['Zoom/Streaming Auto', 'Pop-up Checkpoint', 'Strict 1-to-1'],
	},
	{
		key: 'hybrid',
		label: 'Hybrid',
		desc: 'Tiket fisik & virtual dalam satu acara',
		icon: Shuffle,
		color: '#5e35b1',
		bg: '#ede7f6',
		techTags: [
			'Geofencing (Offline)',
			'Zoom/Streaming (Online)',
			'Dynamic QR',
			'Strict 1-to-1',
		],
	},
];

export const makeTier = (id, isOnline = false) => ({
	id,
	name: 'General Admission',
	type: isOnline ? 'online' : 'offline',
	is_free: false,
	price: isOnline ? 65000 : 150000,
	capacity: 100,
	sale_start: '',
	sale_end: '',
});

export const initTiers = (isOnline = false) => [
	{
		id: 1,
		name: 'Online',
		type: 'online',
		is_free: false,
		price: isOnline ? 35000 : 75000,
		capacity: 50,
		sale_start: '',
		sale_end: '',
	},
	{
		id: 2,
		name: 'Offline',
		type: 'offline',
		is_free: false,
		price: isOnline ? 65000 : 150000,
		capacity: 200,
		sale_start: '',
		sale_end: '',
	},
];
