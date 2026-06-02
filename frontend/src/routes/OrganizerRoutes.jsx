import React from 'react';
import { Route } from 'react-router-dom';
import EventOrganizerGuard from '@/components/guards/EventOrganizerGuard';

// ==========================================
// 🟢 KOMPONEN AKTIF (Digunakan di Menu Saat Ini)
// ==========================================
import OrgDashboardPage from '../pages/organizer/OrgDashboardPage';
import ManageInstitutionTeamPage from '../pages/institution/ManageInstitutionTeamPage';
import ManageAnnouncements from '../pages/organizer/ManageAnnouncements';

import CreateEvent from '@/pages/event/creation/CreateEvent/index';
import EventGeneralInfo from '@/pages/event/creation/detail-event/EventGeneralInfo';
import EventScheduleLocation from '@/pages/event/creation/detail-event/EventLocation';
import EventSession from '@/pages/event/creation/detail-event/EventSession';
import EventTicket from '@/pages/event/creation/detail-event/EventTicket';

import EventDashboardPage from '@/pages/event/management/EventDashboardPage';
import EventPosPage from '@/pages/event/management/EventPosPage/index'; // Digunakan untuk Check-in
import ScannerPage from '../pages/organizer/ScannerPage'; // Disiapkan jika dipanggil dari dalam Check-in
import EventParticipantList from '@/pages/event/management/EventParticipantListPage/index';
import EventPostMaterial from '@/pages/event/post-event/EventPostMaterialPage/index';
import EventSurveyPage from '@/pages/event/management/EventSurveyPage/index';
import EventCertificatePage from '@/pages/event/post-event/certificate/EventCertificatePage.jsx';

// ==========================================
// 🔴 KOMPONEN TIDAK DIPAKAI / DISIMPAN SEMENTARA
// ==========================================
/*
import EventMaterial from '@/pages/event/management/EventMaterialPage/index';
import EventQuiz from '@/pages/event/management/EventQuizPage/index';
import EventLocationTest from '@/pages/event/creation/EventLocationTest/index';
import EventPreviewPage from '@/pages/event/management/EventDashboardPage/EventPreviewPage';
import EventMaterialDistributionPage from '@/pages/event/management/EventMaterialDistributionPage/index';
import OrganizerMaterialsManagePage from '@/pages/event/management/OrganizerMaterialsManagePage/index';
import EventStatistics from '@/pages/event/management/EventStatisticsPage/index';
import EventPromotion from '@/pages/event/management/EventPromotionPage/index';
import PostEventContentUploadPage from '@/pages/event/post-event/PostEventContentUploadPage/index';
import EventWalletSplitPage from '@/pages/event/management/EventWalletSplitPage/index';
import EventAnalyticsPage from '@/pages/event/management/EventAnalyticsPage/index';
*/

export const OrganizerRoutes = (
	<Route path="organizer">
		{/* Main Organizer Routes */}
		<Route path="dashboard" element={<OrgDashboardPage />} />
		<Route path="kelola-tim-institusi" element={<ManageInstitutionTeamPage />} />
		<Route path="daftar-acara" element={<CreateEvent />} />
		<Route path="buat-acara" element={<CreateEvent />} />

		{/* ========================================== */}
		{/* EVENT DASHBOARD ROUTES (FLAT HIERARCHY)    */}
		{/* ========================================== */}
		<Route path=":eventId/event-dashboard" element={<EventOrganizerGuard />}>
			{/* Halaman Default (Dashboard) */}
			<Route index element={<EventDashboardPage />} />

			{/* ========================================== */}
			{/* EVENT DASHBOARD ROUTES                     */}
			{/* ========================================== */}
			<Route index element={<EventDashboardPage />} />

			{/* Pemecahan Detail Event (Bungkus dengan path "detail") */}
			<Route path="info" element={<EventGeneralInfo />} />
			<Route path="tempat" element={<EventScheduleLocation />} />
			<Route path="sesi" element={<EventSession />} />
			<Route path="tiket" element={<EventTicket />} />
			
			{/* Operasional / Manajemen Peserta */}
			<Route path="daftar-peserta" element={<EventParticipantList />} />
			<Route path="check-in" element={<EventPosPage />} />

			{/* Modul Belajar & Interaksi */}
			<Route path="materi-after" element={<EventPostMaterial />} />
			<Route path="survey-form" element={<EventSurveyPage />} />
			<Route path="sertifikat" element={<EventCertificatePage />} />
			<Route path="pengumuman" element={<ManageAnnouncements />} />
			{/* Operasional / Manajemen Peserta */}
			<Route path="daftar-peserta" element={<EventParticipantList />} />
			{/* Karena disatukan, arahkan check-in ke PosPage. Jika butuh scanner, bisa diakses dari dalam PosPage */}
			<Route path="check-in" element={<EventPosPage />} />

			{/* Modul Belajar & Interaksi */}
			<Route path="materi-after" element={<EventPostMaterial />} />
			<Route path="survey-form" element={<EventSurveyPage />} />
			<Route path="sertifikat" element={<EventCertificatePage />} />
			<Route path="pengumuman" element={<ManageAnnouncements />} />

			{/* ========================================== */}
			{/* ROUTE TIDAK DIPAKAI / HIDDEN DARI MENU     */}
			{/* ========================================== */}
			{/*
			<Route path="scanner" element={<ScannerPage />} /> // Opsional jika ingin tetap diakses via URL langsung
            <Route path="materi-acara" element={<EventMaterial />} />
            <Route path="kuis" element={<EventQuiz />} />
            <Route path="statistik" element={<EventStatistics />} />
            <Route path="wallet-split" element={<EventWalletSplitPage />} />
            <Route path="revenue-analytic" element={<EventAnalyticsPage />} />
            <Route path="promosi" element={<EventPromotion />} />
            <Route path="event-location-test" element={<EventLocationTest />} />
            */}
		</Route>
	</Route>
);
