import React, { useState, useCallback } from 'react';
import './EventCertificatePage.css';

// Mengimpor komponen-komponen yang telah dipisah
import Topbar from './Topbar';
import CanvasArea from './CanvasArea';
import SidebarList from './SidebarList';
import SidebarEdit from './SidebarEdit';
import { INITIAL_ELEMENTS } from './constants';
import EventLayout from '@/layouts/EventLayout';
const EventCertificatePage = () => {
	// Global State
	const [templateFile, setTemplateFile] = useState(null);
	const [elements, setElements] = useState(INITIAL_ELEMENTS);
	const [selectedId, setSelectedId] = useState(null);
	const [saved, setSaved] = useState(false);

	// Derived State
	const selectedEl = elements.find((e) => e.id === selectedId) ?? null;

	// Handlers
	const handleFileSelect = (file) => setTemplateFile(URL.createObjectURL(file));

	const handleSave = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const addField = (field) => {
		const el = {
			id: `ce${Date.now()}`,
			fieldId: field.id,
			label: field.key,
			x: 30 + Math.random() * 40,
			y: 30 + Math.random() * 40,
			fontSize: field.id === 'f1' ? 24 : 14,
			bold: field.id === 'f1',
			color: '#0f172a',
		};
		setElements((p) => [...p, el]);
		setSelectedId(el.id);
	};

	const updateEl = useCallback((id, patch) => {
		setElements((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
	}, []);

	const deleteEl = (id) => {
		setElements((p) => p.filter((e) => e.id !== id));
		setSelectedId(null);
	};

	return (
		<EventLayout
			title="Buat Sertifikat"
			description="Klik elemen untuk mengedit · Tarik untuk memindahkan"
			sidebar={
				selectedEl ? (
					<SidebarEdit
						selectedEl={selectedEl}
						updateEl={updateEl}
						deleteEl={deleteEl}
						clearSelection={() => setSelectedId(null)}
					/>
				) : (
					<SidebarList
						elements={elements}
						addField={addField}
						deleteEl={deleteEl}
						setSelectedId={setSelectedId}
					/>
				)
			}>
			<div className="d-flex flex-column certificate-builder">
				{/* Top Header */}
				{/* <Topbar saved={saved} onSave={handleSave} /> */}

				{/* Main Body */}
				{/* Canvas / Gambar Sertifikat */}
				<CanvasArea
					templateFile={templateFile}
					elements={elements}
					selectedId={selectedId}
					onFileSelect={handleFileSelect}
					setSelectedId={setSelectedId}
					updateEl={updateEl}
				/>

				<div className="">
					{/* Right Sidebar */}
					{/* <div className="bg-white border-start d-flex flex-column sidebar-panel flex-shrink-0">
						{selectedEl ? (
							<SidebarEdit
								selectedEl={selectedEl}
								updateEl={updateEl}
								deleteEl={deleteEl}
								clearSelection={() => setSelectedId(null)}
							/>
						) : (
							<SidebarList
								elements={elements}
								addField={addField}
								deleteEl={deleteEl}
								setSelectedId={setSelectedId}
							/>
						)}
					</div> */}
				</div>
			</div>
		</EventLayout>
	);
};

export default EventCertificatePage;
