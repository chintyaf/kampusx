import React from 'react';
import { Route } from 'react-router-dom';

import OrgDashboardPage from '../pages/organizer/OrgDashboardPage';
import ManageInstitutionTeamPage from '../pages/institution/ManageInstitutionTeamPage';
import ScannerPage from '../pages/organizer/ScannerPage';

// CREATE EVENT PAGES
import CreateEvent from '../pages/event/creation/CreateEvent/index';
import EventGeneralInfo from '../pages/event/creation/detail-event/EventGeneralInfo';
import EventScheduleLocation from '../pages/event/creation/detail-event/EventLocation';
import EventSession from '../pages/event/creation/detail-event/EventSession';
import EventSpeaker from '../pages/event/creation/detail-event/EventSpeaker';
import EventRegistrationForm from '../pages/event/creation/detail-event/EventRegistrationForm';
import EventTicket from '../pages/event/creation/detail-event/EventTicket';
import EventLocationTest from '../pages/event/creation/EventLocationTest/index';

import EventDashboardPage from '../pages/event/management/EventDashboardPage';
import EventStaffManagement from '../pages/event/management/EventStaffManagementPage/index';
import EventParticipantList from '../pages/event/management/EventParticipantListPage/index';
import EventMaterialDistributionPage from '../pages/event/management/EventMaterialDistributionPage/index';
import OrganizerMaterialsManagePage from '../pages/event/management/OrganizerMaterialsManagePage/index';
import EventStatistics from '../pages/event/management/EventStatisticsPage/index';
import EventPromotion from '../pages/event/management/EventPromotionPage/index';
import EventSurveyPage from '../pages/event/management/EventSurveyPage/index';

import CertificateToolPage from '../pages/event/post-event/CertificateToolPage/index';
import PostEventContentUploadPage from '../pages/event/post-event/PostEventContentUploadPage/index';

export const OrganizerRoutes = (
    <Route path="organizer">
        <Route path="dashboard" element={<OrgDashboardPage />} />
        <Route path="kelola-tim-institusi" element={<ManageInstitutionTeamPage />} />
        <Route path="daftar-acara" element={<CreateEvent />} />
        <Route path="buat-acara" element={<CreateEvent />} />

        {/* Event Routes untuk Detail Event */}
        <Route path=":eventId/event-dashboard">
            <Route path="" element={<EventDashboardPage />} />
            <Route path="detail">
                <Route path="info" element={<EventGeneralInfo />} />
                <Route path="tempat" element={<EventScheduleLocation />} />
                <Route path="sesi" element={<EventSession />} />
                <Route path="pembicara" element={<EventSpeaker />} />
                <Route path="formulir" element={<EventRegistrationForm />} />
                <Route path="tiket" element={<EventTicket />} />
            </Route>
            <Route path="kelola-staff" element={<EventStaffManagement />} />

            <Route path="daftar-peserta" element={<EventParticipantList />} />
            <Route path="distribusi-materi" element={<EventMaterialDistributionPage />} />
            <Route path="kelola-materi" element={<OrganizerMaterialsManagePage />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="upload-sertifikat" element={<EventStaffManagement />} />

            <Route path="statistik" element={<EventStatistics />} />
            <Route path="promosi" element={<EventPromotion />} />
            <Route path="survey" element={<EventSurveyPage />} />

            {/* NEW: SERTIFIKAT & AFTER EVENT CHINTYA */}
            <Route path="cetak-sertifikat" element={<CertificateToolPage />} />
            <Route path="upload-materi-after" element={<PostEventContentUploadPage />} />

            <Route path="event-location-test" element={<EventLocationTest />} />
        </Route>
    </Route>
);
