import { STORAGE_URL } from '@/api/storage';

export const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const transformEventData = (ev) => {
	const loc = ev.location_detail || ev.locationDetail || {};
	const eventType = loc.type || ev.location_type || "offline";
	const display = eventType === "online"
		? (loc.platform ? `Online (${loc.platform})` : "Online Meeting")
		: (loc.location_name || loc.city || "Offline Venue");
	const rawLat = eventType !== "online" ? parseFloat(loc.latitude) : NaN;
	const rawLng = eventType !== "online" ? parseFloat(loc.longitude) : NaN;
	return {
		...ev,
		id: ev.id,
		slug: ev.slug,
		title: ev.title,
		org: ev.organizer?.name ?? "Unknown",
		image: ev.image_path ? `${STORAGE_URL}/${ev.image_path}` : `${STORAGE_URL}/event-banners/${ev.id}.jpg`,
		date: ev.start_date
			? new Date(ev.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
			: "Tanggal Belum Ditentukan",
		price: ev.price,
		location: display,
		isOnline: ["online", "hybrid"].includes(eventType),
		isInPerson: ["offline", "hybrid"].includes(eventType),
		isFeatured: ev.id % 2 === 0,
		lat: isNaN(rawLat) ? null : rawLat,
		lng: isNaN(rawLng) ? null : rawLng,
	};
};
