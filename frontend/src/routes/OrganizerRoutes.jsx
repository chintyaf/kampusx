import React from 'react';
import { Route } from 'react-router-dom';
import EventOrganizerGuard from '@/components/guards/EventOrganizerGuard';

import OrgDashboardPage from '../pages/organizer/OrgDashboardPage';
import ManageInstitutionTeamPage from '../pages/institution/ManageInstitutionTeamPage';
import ScannerPage from '../pages/organizer/ScannerPage';
import ManageAnnouncements from '../pages/organizer/ManageAnnouncements';

// CREATE EVENT PAGES
import CreateEvent from '../pages/event/creation/CreateEvent/index';
import EventGeneralInfo from '../pages/event/creation/detail-event/EventGeneralInfo';
import EventScheduleLocation from '../pages/event/creation/detail-event/EventLocation';
import EventSession from '../pages/event/creation/detail-event/EventSession';
import EventTicket from '../pages/event/creation/detail-event/EventTicket';
import EventMaterial from '../pages/event/management/EventMaterialPage/index';
import EventPostMaterial from '../pages/event/post-event/EventPostMaterialPage/index';
import EventQuiz from '../pages/event/management/EventQuizPage/index';
import EventLocationTest from '../pages/event/creation/EventLocationTest/index';

import EventDashboardPage from '../pages/event/management/EventDashboardPage';
import EventPreviewPage from '../pages/event/management/EventDashboardPage/EventPreviewPage';
import EventPosPage from '../pages/event/management/EventPosPage/index';
import EventParticipantList from '../pages/event/management/EventParticipantListPage/index';
import EventMaterialDistributionPage from '../pages/event/management/EventMaterialDistributionPage/index';
import OrganizerMaterialsManagePage from '../pages/event/management/OrganizerMaterialsManagePage/index';
import EventStatistics from '../pages/event/management/EventStatisticsPage/index';
import EventPromotion from '../pages/event/management/EventPromotionPage/index';
import EventSurveyPage from '../pages/event/management/EventSurveyPage/index';

import CertificateListPage from '../pages/event/post-event/certificate/CertificateListPage';
import CreateCertificatePage from '../pages/event/post-event/certificate/CreateCertificatePage';
import PostEventContentUploadPage from '../pages/event/post-event/PostEventContentUploadPage/index';
// import { Certificate } from 'node:crypto';
import EventCertificatePage from '../pages/event/post-event/certificate/EventCertificatePage.jsx';
import EventWalletSplitPage from '../pages/event/management/EventWalletSplitPage/index';
import EventAnalyticsPage from '../pages/event/management/EventAnalyticsPage/index';

export const OrganizerRoutes = (
	<Route path="organizer">
		<Route path="dashboard" element={<OrgDashboardPage />} />
		<Route path="kelola-tim-institusi" element={<ManageInstitutionTeamPage />} />
		<Route path="daftar-acara" element={<CreateEvent />} />
		<Route path="buat-acara" element={<CreateEvent />} />

		{/* Event Routes untuk Detail Event */}
		<Route path=":eventId/event-dashboard" element={<EventOrganizerGuard />}>
			<Route path="" element={<EventDashboardPage />} />
			<Route path="preview" element={<EventPreviewPage />} />
			<Route path="detail">
				<Route path="info" element={<EventGeneralInfo />} />
				<Route path="tempat" element={<EventScheduleLocation />} />
				<Route path="sesi" element={<EventSession />} />
				<Route path="tiket" element={<EventTicket />} />
			</Route>

			<Route path="event-pos" element={<EventPosPage />} />

			<Route path="daftar-peserta" element={<EventParticipantList />} />

			{/* Modul Belajar */}
			<Route path="modul-belajar">
				<Route path="materi-acara" element={<EventMaterial />} />
				<Route path="materi-after" element={<EventPostMaterial />} />
				<Route path="kuis" element={<EventQuiz />} />
			</Route>

			<Route path="scanner" element={<ScannerPage />} />
			<Route path="pengumuman" element={<ManageAnnouncements />} />
			<Route path="upload-sertifikat" element={<EventPosPage />} />

			<Route path="statistik" element={<EventStatistics />} />
			<Route path="wallet-split" element={<EventWalletSplitPage />} />
			<Route path="revenue-analytic" element={<EventAnalyticsPage />} />
			<Route path="promosi" element={<EventPromotion />} />
			<Route path="survey-form" element={<EventSurveyPage />} />
			<Route path="sertifikat" element={<EventCertificatePage />} />

			<Route path="event-location-test" element={<EventLocationTest />} />
		</Route>
	</Route>
);
