import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

// Import sub-components
import OrganizerForm from './components/OrganizerForm';
import StatusInitial from './components/StatusInitial';
import StatusPending from './components/StatusPending';
import StatusApproved from './components/StatusApproved';
import StatusRejected from './components/StatusRejected';

const ApplyOrganizerPage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [request, setRequest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [showForm, setShowForm] = useState(false);

	// Form States
	const [organizerType, setOrganizerType] = useState('internal'); // 'internal' | 'independent'
	const [institutions, setInstitutions] = useState([]);
	const [organizationName, setOrganizationName] = useState('');
	const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
	const [customInstitutionName, setCustomInstitutionName] = useState('');
	const [note, setNote] = useState('');
	const [proofFileName, setProofFileName] = useState('');

	useEffect(() => {
		if (!user) {
			navigate('/register');
			return;
		}
		fetchRequestStatus();
		fetchInstitutions();
	}, [user]);

	const fetchRequestStatus = async () => {
		try {
			setLoading(true);
			const response = await api.get('/organizer-requests/status');
			const reqData = response.data.data;
			setRequest(reqData);

			// Jika dipicu oleh klik notifikasi penolakan, otomatis buka form dengan prefill
			if (
				reqData &&
				reqData.status === 'rejected' &&
				reqData.can_resubmit &&
				location.state?.autoResubmit
			) {
				prefillForm(reqData);
				// Ganti router state agar jika direfresh form tidak terus-terusan mengembang
				navigate(window.location.pathname, { replace: true });
			}
		} catch (error) {
			console.error('Gagal mengambil status pengajuan:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchInstitutions = async () => {
		try {
			const response = await api.get('/institutions');
			setInstitutions(response.data.data || response.data || []);
		} catch (error) {
			console.error('Gagal mengambil daftar institusi:', error);
		}
	};

	const prefillForm = (reqData) => {
		const isInternal = reqData.institution_id || reqData.custom_institution_name;
		setOrganizerType(isInternal ? 'internal' : 'independent');
		setOrganizationName(reqData.organization_name || '');
		setSelectedInstitutionId(
			reqData.institution_id || (reqData.custom_institution_name ? 'custom' : ''),
		);
		setCustomInstitutionName(reqData.custom_institution_name || '');
		setNote(reqData.note || '');
		setProofFileName(
			reqData.proof_path
				? 'Dokumen Bukti Sebelumnya (Tetap digunakan jika tidak diganti)'
				: '',
		);
		setShowForm(true);
	};

	const handleApply = async (formData) => {
		try {
			setSubmitting(true);
			await api.post('/organizer-requests/apply', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			setShowForm(false);
			fetchRequestStatus();
		} catch (error) {
			console.error('Gagal mengajukan permohonan:', error);
			alert(error.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan.');
		} finally {
			setSubmitting(false);
		}
	};

	const resetFormStates = () => {
		setOrganizerType('internal');
		setOrganizationName('');
		setSelectedInstitutionId('');
		setCustomInstitutionName('');
		setNote('');
		setProofFileName('');
	};

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh',
				}}
			>
				<Spinner animation="border" style={{ color: 'var(--primary)' }} />
			</div>
		);
	}

	const renderContent = () => {
		if (request.status === 'pending') {
			return <StatusPending request={request} onBack={() => navigate('/')} />;
		}

		if (request.status === 'approved') {
			return (
				<StatusApproved
					onBack={() => navigate('/')}
					onManageEvents={() => navigate('/organizer/dashboard')}
				/>
			);
		}

		if (request.status === 'rejected') {
			return (
				<StatusRejected
					request={request}
					onBack={() => navigate('/')}
					onResubmit={() => prefillForm(request)}
				/>
			);
		}

		return null;
	};

	return (
		<Container style={{ paddingTop: 60, paddingBottom: 60 }}>
			<div
				className="bg-white p-4 border shadow-sm mx-auto animate__animated animate__fadeIn"
				style={{ maxWidth: 580, borderRadius: 12 }}
			>
				{!request || showForm ? (
					<OrganizerForm
						initialData={{
							organizerType,
							organizationName,
							selectedInstitutionId,
							customInstitutionName,
							note,
							proofFileName,
						}}
						institutions={institutions}
						submitting={submitting}
						request={request}
						onSubmit={handleApply}
						onCancel={() => {
							if (request) {
								setShowForm(false);
							} else {
								navigate('/');
							}
						}}
					/>
				) : (
					renderContent()
				)}
			</div>
		</Container>
	);
};

export default ApplyOrganizerPage;
