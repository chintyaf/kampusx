import React from 'react';
import AdminMasterDataPage from '../../components/admin/AdminMasterDataPage';

const AdminDashboardPage = () => {
	return (
		<>
			<AdminMasterDataPage
				title="Kategori"
				endpoint={{ get: '/categories', admin: '/admin/categories' }}
				itemName="Kategori"
			/>
			<AdminMasterDataPage
				title="Tipe Event"
				endpoint={{ get: '/event-types', admin: '/admin/event-types' }}
				itemName="Tipe Event"
			/>
		</>
	);
};

export default AdminDashboardPage;
