import React from 'react';
import { Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { Gift } from 'lucide-react';

const RewardsTab = ({
	event,
	memberPoints,
	localRewardsCatalog,
	myRedemptions,
	handleRedeemReward,
}) => {
	return (
		<div className="fade-in">
			{/* Point balance widget */}
			<div
				className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4 rounded-4 mb-4 border bg-gradient text-dark"
				style={{
					background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)',
					borderColor: '#ffe4e6',
				}}
			>
				<div>
					<span className="text-secondary small fw-semibold">
						Saldo Poin Lokal Anda
					</span>
					<h2 className="fw-extrabold text-primary mb-1 d-flex align-items-center gap-2">
						<Gift className="text-warning animate-bounce" />
						<span>{memberPoints} Poin</span>
					</h2>
					<p
						className="text-muted mb-0 small"
						style={{ fontSize: '0.75rem' }}
					>
						Dapatkan lebih banyak poin dengan melakukan check-in, mengisi
						survey, bertanya di sesi, atau mengunjungi booth sponsor.
					</p>
				</div>
				<Badge
					bg="light"
					className="text-dark border px-3 py-2 rounded-pill mt-3 mt-md-0 font-semibold text-xs shadow-sm"
				>
					Event: {event?.title || 'Workshop & Kelas'}
				</Badge>
			</div>

			{/* Rewards Catalog */}
			<h5 className="fw-bold text-dark mb-3">Katalog Hadiah Lokal</h5>
			<Row className="g-4 mb-5">
				{localRewardsCatalog
					.filter((r) => r.is_active)
					.map((reward) => {
						const claimCount = myRedemptions.filter(
							(r) =>
								r.reward_title === reward.title &&
								r.status !== 'cancelled',
						).length;
						const isReachedLimit =
							reward.limit_per_user !== null &&
							claimCount >= reward.limit_per_user;
						const isOutOfStock = reward.stock !== null && reward.stock <= 0;
						const isPointsInsufficient = memberPoints < reward.points_cost;

						return (
							<Col xs={12} md={6} key={reward.id}>
								<Card className="border shadow-none rounded-4 overflow-hidden h-100 transition-all hover-shadow">
									<div
										className="position-relative"
										style={{ height: '180px' }}
									>
										<img
											src={reward.image_url || reward.image_path}
											alt={reward.title}
											className="w-100 h-100 object-fit-cover"
										/>
										<div className="position-absolute top-0 start-0 p-2.5">
											<Badge
												bg={
													reward.reward_type === 'physical'
														? 'info'
														: 'success'
												}
												className="px-2.5 py-1.5 shadow-sm text-xxs font-bold text-white border border-opacity-10"
											>
												{reward.reward_type === 'physical'
													? 'Fisik'
													: 'Digital'}
											</Badge>
										</div>
										<div className="position-absolute top-0 end-0 p-2.5">
											<Badge
												bg="dark"
												className="bg-opacity-75 px-2.5 py-1.5 shadow-sm text-xxs font-bold text-white"
											>
												{reward.points_cost} Pts
											</Badge>
										</div>
									</div>
									<Card.Body className="p-3.5 d-flex flex-column justify-content-between">
										<div>
											<h6 className="fw-bold text-dark mb-1.5">
												{reward.title}
											</h6>
											<p
												className="text-muted small mb-3"
												style={{
													fontSize: '0.78rem',
													lineHeight: '1.4',
												}}
											>
												{reward.description}
											</p>
										</div>
										<div>
											<div
												className="d-flex justify-content-between text-secondary mb-3 small"
												style={{ fontSize: '0.75rem' }}
											>
												<span>
													Stok:{' '}
													{reward.stock !== null ? (
														<strong>
															{reward.stock} Pcs
														</strong>
													) : (
														<strong className="text-muted">
															Tak terbatas
														</strong>
													)}
												</span>
												{reward.limit_per_user && (
													<span>
														Batas:{' '}
														<strong>
															{claimCount}/
															{reward.limit_per_user}x
														</strong>
													</span>
												)}
											</div>
											<Button
												variant={
													isOutOfStock
														? 'secondary'
														: isReachedLimit
															? 'light'
															: 'primary'
												}
												disabled={
													isOutOfStock ||
													isReachedLimit ||
													isPointsInsufficient
												}
												className="w-100 rounded-pill py-2 text-xs fw-bold shadow-sm"
												onClick={() =>
													handleRedeemReward(reward)
												}
											>
												{isOutOfStock
													? 'Stok Habis'
													: isReachedLimit
														? 'Mencapai Batas'
														: isPointsInsufficient
															? `Butuh ${reward.points_cost} Poin`
															: 'Tukar Poin Sekarang'}
											</Button>
										</div>
									</Card.Body>
								</Card>
							</Col>
						);
					})}
			</Row>

			{/* Redemption History */}
			<h5 className="fw-bold text-dark mb-3">Riwayat Penukaran Saya</h5>
			<Card className="border shadow-none rounded-4 overflow-hidden">
				<div className="table-responsive">
					<Table
						hover
						className="align-middle mb-0 custom-table"
						style={{ fontSize: '0.85rem' }}
					>
						<thead className="bg-light">
							<tr
								className="text-secondary"
								style={{ fontSize: '0.8rem' }}
							>
								<th className="px-4 py-2.5">Tanggal</th>
								<th className="py-2.5">Hadiah</th>
								<th className="py-2.5 text-center">Poin spent</th>
								<th className="py-2.5">Status</th>
								<th className="px-4 py-2.5">Catatan Penukaran</th>
							</tr>
						</thead>
						<tbody>
							{myRedemptions.length === 0 ? (
								<tr>
									<td
										colSpan="5"
										className="text-center py-4 text-muted small"
									>
										Belum ada penukaran reward yang tercatat.
									</td>
								</tr>
							) : (
								myRedemptions.map((item) => (
									<tr key={item.id}>
										<td className="px-4 py-3 text-secondary">
											{new Date(
												item.redeemed_at,
											).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'short',
												year: 'numeric',
											})}
										</td>
										<td className="py-3">
											<span className="fw-bold text-dark">
												{item.reward_title}
											</span>
											<div className="text-xxs text-muted">
												{item.reward_type === 'physical'
													? 'Fisik'
													: 'Digital'}
											</div>
										</td>
										<td className="py-3 text-center fw-bold text-secondary">
											{item.points_spent}
										</td>
										<td className="py-3">
											{item.status === 'pending' && (
												<Badge
													bg="warning"
													className="text-dark"
												>
													Menunggu
												</Badge>
											)}
											{item.status === 'claimed' && (
												<Badge
													bg="success"
													className="text-white"
												>
													Diambil
												</Badge>
											)}
											{item.status === 'delivered' && (
												<Badge
													bg="success"
													className="text-white"
												>
													Terkirim
												</Badge>
											)}
											{item.status === 'cancelled' && (
												<Badge
													bg="danger"
													className="text-white"
												>
													Dibatalkan
												</Badge>
											)}
										</td>
										<td className="px-4 py-3">
											<div
												className="small text-secondary"
												style={{
													fontSize: '0.75rem',
													maxWidth: '250px',
												}}
											>
												{item.status === 'cancelled' ? (
													<span className="text-danger fw-semibold">
														Ditolak:{' '}
														{item.cancellation_reason ||
															'Dibatalkan oleh panitia'}
													</span>
												) : (
													item.notes
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</Table>
				</div>
			</Card>
		</div>
	);
};

export default RewardsTab;
