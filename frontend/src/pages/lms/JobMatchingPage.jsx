import React, { useEffect, useState } from 'react';
import {
	Container,
	Row,
	Col,
	Card,
	Form,
	Button,
	Badge,
	ProgressBar,
	Table,
	Spinner,
	Alert,
} from 'react-bootstrap';
import { Search, X } from 'lucide-react';
import api from '@/api/axios';

const styles = {
	page: {
		backgroundColor: 'var(--color-bg)',
		minHeight: '100vh',
		padding: '28px 0',
		color: 'var(--text)',
	},
	card: {
		border: '1px solid var(--color-border)',
		borderRadius: 'var(--radius-lg)',
		boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
	},
	label: {
		fontSize: 'var(--font-sm)',
		fontWeight: 600,
		marginBottom: 8,
		color: 'var(--text)',
	},
	muted: {
		fontSize: 'var(--font-xs)',
		color: 'var(--text-muted)',
	},
	input: {
		borderRadius: 'var(--radius)',
		fontSize: 'var(--font-sm)',
		padding: '10px 12px',
	},
	skill: {
		backgroundColor: 'var(--primary-light)',
		color: 'var(--primary)',
		border: '1px solid var(--primary-border)',
		fontWeight: 500,
		padding: '6px 10px',
	},
};

const JobMatchingPage = () => {
	const [skills, setSkills] = useState([]);
	const [selectedSkills, setSelectedSkills] = useState([]);
	const [searchSkill, setSearchSkill] = useState('');

	const [results, setResults] = useState([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [selectedMember, setSelectedMember] = useState(null);

	const [loadingSkills, setLoadingSkills] = useState(false);
	const [searching, setSearching] = useState(false);
	const [error, setError] = useState('');

	// Load skills
	useEffect(() => {
		const fetchSkills = async () => {
			try {
				setLoadingSkills(true);

				const response = await api.get('/public/skills');
				const data = response.data.data ?? response.data;

				setSkills(Array.isArray(data) ? data : []);
			} catch (err) {
				setError(err.response?.data?.message || 'Failed to load skills.');
			} finally {
				setLoadingSkills(false);
			}
		};

		fetchSkills();
	}, []);

	// Filter skills
	const filteredSkills = skills.filter((skill) =>
		skill.name.toLowerCase().includes(searchSkill.toLowerCase()),
	);

	// Handle skill selection
	const handleSkillChange = (skillId) => {
		const id = Number(skillId);

		setSelectedSkills((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	// Search matching members
	const handleSearch = async () => {
		if (selectedSkills.length === 0) {
			setError('Please select at least one required skill.');
			return;
		}

		try {
			setSearching(true);
			setError('');
			setSelectedMember(null);

			const response = await api.post('/job-matching/search', {
				required_skills: selectedSkills,
			});

			const mappedResults = (response.data.results || []).map((member) => ({
				id: member.id,
				name: member.name,
				email: member.email,
				matchScore: Number(member.match_score),

				// Skills sesuai pencarian
				matchedSkills: member.matched_skills || [],

				// Skills tambahan yang tidak dicari
				otherSkills: member.other_skills || [],
			}));

			setResults(mappedResults);
			setHasSearched(true);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to search matching members.');
			setResults([]);
			setHasSearched(false);
		} finally {
			setSearching(false);
		}
	};

	return (
		<div style={styles.page}>
			<Container fluid="xl">
				<div className="mb-4">
					<h4 className="fw-bold mb-2">Job Matching</h4>
					<p className="text-muted mb-0" style={{ fontSize: 14 }}>
						Temukan Member berdasarkan kesesuaian kompetensi dengan kebutuhan pekerjaan.
					</p>
				</div>

				{error && (
					<Alert variant="danger" dismissible onClose={() => setError('')}>
						{error}
					</Alert>
				)}

				<Row className="g-4">
					{/* SKILL REQUIREMENTS */}
					<Col lg={4}>
						<Card style={styles.card}>
							<Card.Body className="p-4">
								<div className="mb-4">
									<h6 className="fw-bold mb-1">Required Skills</h6>
									<p style={styles.muted}>
										Pilih kompetensi yang dibutuhkan untuk mencari Member.
									</p>
								</div>

								<Form.Group className="mb-3">
									<Form.Label style={styles.label}>Search Skills</Form.Label>

									<div className="position-relative">
										<Search
											size={17}
											className="position-absolute text-muted"
											style={{
												left: 12,
												top: '50%',
												transform: 'translateY(-50%)',
											}}
										/>

										<Form.Control
											style={{
												...styles.input,
												paddingLeft: 38,
											}}
											value={searchSkill}
											onChange={(e) => setSearchSkill(e.target.value)}
											placeholder="Search skill name..."
										/>
									</div>
								</Form.Group>

								<Form.Group className="mb-3">
									<div className="d-flex justify-content-between mb-2">
										<Form.Label style={styles.label}>
											Available Skills
										</Form.Label>

										<span style={styles.muted}>
											{filteredSkills.length} skills
										</span>
									</div>

									{loadingSkills ? (
										<div className="text-muted small py-3 text-center">
											<Spinner size="sm" className="me-2" />
											Loading skills...
										</div>
									) : (
										<div
											className="border rounded p-3"
											style={{
												maxHeight: 240,
												overflowY: 'auto',
											}}
										>
											{filteredSkills.map((skill) => (
												<Form.Check
													key={skill.id}
													type="checkbox"
													id={`skill-${skill.id}`}
													label={skill.name}
													checked={selectedSkills.includes(
														Number(skill.id),
													)}
													onChange={() => handleSkillChange(skill.id)}
													className="mb-2"
												/>
											))}

											{filteredSkills.length === 0 && (
												<p className="text-muted small mb-0 text-center">
													No skills found.
												</p>
											)}
										</div>
									)}
								</Form.Group>

								{/* SELECTED SKILLS */}
								<div className="mb-4">
									<div className="d-flex justify-content-between mb-2">
										<span className="fw-semibold" style={{ fontSize: 13 }}>
											Selected Skills
										</span>
										<span style={styles.muted}>
											{selectedSkills.length} selected
										</span>
									</div>

									<div className="d-flex flex-wrap gap-2">
										{selectedSkills.map((id) => {
											const skill = skills.find(
												(item) => Number(item.id) === id,
											);

											return skill ? (
												<Badge
													key={id}
													style={styles.skill}
													className="d-flex align-items-center gap-2"
												>
													{skill.name}
													<X
														size={13}
														role="button"
														onClick={() => handleSkillChange(id)}
													/>
												</Badge>
											) : null;
										})}

										{selectedSkills.length === 0 && (
											<span style={styles.muted}>No skills selected.</span>
										)}
									</div>
								</div>

								<Button
									variant="primary"
									className="w-100 fw-semibold"
									onClick={handleSearch}
									disabled={searching || loadingSkills}
								>
									{searching ? (
										<>
											<Spinner size="sm" className="me-2" />
											Searching...
										</>
									) : (
										'Find Matching Members'
									)}
								</Button>
							</Card.Body>
						</Card>
					</Col>

					{/* MATCHING RESULTS */}
					<Col lg={8}>
						<Row className="g-3 mb-3">
							<Col sm={6}>
								<Card style={styles.card}>
									<Card.Body className="p-3">
										<div style={styles.muted}>Matching Members</div>
										<h3 className="fw-bold mb-0 mt-2">{results.length}</h3>
									</Card.Body>
								</Card>
							</Col>

							<Col sm={6}>
								<Card style={styles.card}>
									<Card.Body className="p-3">
										<div style={styles.muted}>Highest Match Score</div>
										<h3
											className="fw-bold mb-0 mt-2"
											style={{ color: 'var(--primary)' }}
										>
											{results.length
												? `${(results[0].matchScore * 100).toFixed(1)}%`
												: '—'}
										</h3>
									</Card.Body>
								</Card>
							</Col>
						</Row>

						<Card style={styles.card}>
							<Card.Body className="p-4">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<div>
										<h6 className="fw-bold mb-1">Matching Results</h6>
										<p style={styles.muted}>
											{hasSearched
												? `Results for ${selectedSkills.length} selected skills`
												: 'Select required skills to see matching results.'}
										</p>
									</div>

									{hasSearched && (
										<Badge bg="light" text="dark" className="border">
											{results.length} Members
										</Badge>
									)}
								</div>

								{!hasSearched ? (
									<div className="text-center py-5">
										<div className="mb-3" style={{ color: 'var(--primary)' }}>
											<Search size={36} />
										</div>
										<p className="fw-semibold mb-1">No matching results yet</p>
										<p style={styles.muted}>
											Select required skills to find suitable Member profiles.
										</p>
									</div>
								) : results.length === 0 ? (
									<div className="text-center py-5">
										<p className="fw-semibold mb-1">
											No matching members found
										</p>
										<p style={styles.muted}>
											No Member profiles have matching skill evidence.
										</p>
									</div>
								) : (
									<div className="table-responsive">
										<Table hover className="align-middle mb-0">
											<thead>
												<tr
													style={{
														fontSize: 12,
														color: 'var(--text-muted)',
													}}
												>
													<th>MEMBER</th>
													<th>MATCH SCORE</th>
													<th>MATCHED SKILLS</th>
													<th>Other SKILLS</th>
													<th></th>
												</tr>
											</thead>

											<tbody>
												{results.map((member) => (
													<tr key={member.id}>
														<td>
															<div className="d-flex align-items-center gap-2">
																<div
																	className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
																	style={{
																		width: 38,
																		height: 38,
																		flexShrink: 0,
																		backgroundColor:
																			'var(--primary-light)',
																		color: 'var(--primary)',
																		fontSize: 13,
																	}}
																>
																	{member.name.charAt(0)}
																</div>

																<div>
																	<div
																		className="fw-semibold"
																		style={{ fontSize: 13 }}
																	>
																		{member.name}
																	</div>
																	<div style={styles.muted}>
																		{member.email}
																	</div>
																</div>
															</div>
														</td>

														<td style={{ minWidth: 130 }}>
															<div
																className="fw-bold mb-1"
																style={{
																	color: 'var(--primary)',
																	fontSize: 14,
																}}
															>
																{(member.matchScore * 100).toFixed(
																	1,
																)}
																%
															</div>

															<ProgressBar
																now={member.matchScore * 100}
																style={{
																	height: 6,
																	backgroundColor:
																		'var(--neutral-bg)',
																}}
															/>
														</td>

														<td>
															<div className="d-flex flex-wrap gap-1">
																{member.matchedSkills.length > 0 ? (
																	member.matchedSkills.map(
																		(skill) => (
																			<Badge
																				key={skill.id}
																				bg="secondary"
																			>
																				{skill.name}
																			</Badge>
																		),
																	)
																) : (
																	<span style={styles.muted}>
																		None
																	</span>
																)}
															</div>
														</td>

														<td>
															<Button
																size="sm"
																variant="outline-primary"
																onClick={() =>
																	setSelectedMember(member)
																}
															>
																Details
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</Table>
									</div>
								)}
							</Card.Body>
						</Card>

						{/* MEMBER DETAILS */}
						{selectedMember && (
							<Card className="mt-3" style={styles.card}>
								<Card.Body className="p-4">
									<div className="d-flex justify-content-between align-items-start mb-4">
										<div>
											<h6 className="fw-bold mb-1">{selectedMember.name}</h6>
											<p style={styles.muted}>Competency Profile</p>
										</div>

										<Button
											variant="light"
											size="sm"
											onClick={() => setSelectedMember(null)}
										>
											Close
										</Button>
									</div>

									<div className="mb-4">
										<div style={styles.muted}>Overall Match Score</div>
										<h3
											className="fw-bold mt-1"
											style={{ color: 'var(--primary)' }}
										>
											{(selectedMember.matchScore * 100).toFixed(1)}%
										</h3>
									</div>

									<Row className="g-4">
										{/* MATCHED SKILLS */}
										<Col md={6}>
											<div
												className="fw-semibold mb-2"
												style={{ fontSize: 13 }}
											>
												Matched Skills
											</div>
											<p style={styles.muted}>
												Skills owned by this Member that match the
												requirements.
											</p>

											<div className="d-flex flex-wrap gap-2">
												{selectedMember.matchedSkills.map((skill) => (
													<Badge key={skill.id} style={styles.skill}>
														{skill.name}
														<span className="ms-1 opacity-75">
															({Number(skill.score).toFixed(2)})
														</span>
													</Badge>
												))}

												{selectedMember.matchedSkills.length === 0 && (
													<span style={styles.muted}>
														No matching skills.
													</span>
												)}
											</div>
										</Col>

										{/* OTHER SKILLS */}
										<Col md={6}>
											<div
												className="fw-semibold mb-2"
												style={{ fontSize: 13 }}
											>
												Other Skills
											</div>
											<p style={styles.muted}>
												Additional skills owned by this Member that are not
												part of the requirements.
											</p>

											<div className="d-flex flex-wrap gap-2">
												{selectedMember.otherSkills.map((skill) => (
													<Badge key={skill.id} bg="secondary">
														{skill.name}
														<span className="ms-1 opacity-75">
															({Number(skill.score).toFixed(2)})
														</span>
													</Badge>
												))}

												{selectedMember.otherSkills.length === 0 && (
													<span style={styles.muted}>
														No additional skills.
													</span>
												)}
											</div>
										</Col>
									</Row>
								</Card.Body>
							</Card>
						)}
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default JobMatchingPage;
