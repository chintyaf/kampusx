import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { Row, Col } from 'react-bootstrap';
import { Ticket, DollarSign, UserCheck, UserMinus, Users } from 'lucide-react';
import '../../../../assets/css/dashboard.css';

import PageHeader from './PageHeader';
import StatCards from '@/components/dashboard/StatCards';
import EventInfoCard from './EventInfoCard';
import EventTimeline from './EventTimeline';
import MissingInformation from './MissingInformation';
import SessionTable from './SessionTable';
import DemographicsCard from './DemographicsCard';
import TicketDistribution from './TicketDistribution';
import { Skeleton, SkeletonStyles } from '@/components/Skeleton';

const DashboardSkeleton = () => (
	<div className="">
		<SkeletonStyles />
		{/* 1. Header */}
		<Row className="align-items-center mb-4">
			<Col>
				<Skeleton width="220px" height="24px" className="mb-2" />
				<Skeleton width="350px" height="14px" />
			</Col>
		</Row>

		{/* 2. Stat Cards */}
		<Row className="g-3 mb-4">
			{[1, 2, 3, 4].map((i) => (
				<Col key={i} xs={12} sm={6} lg={3}>
					<div className="card" style={{ padding: '16px 18px', minHeight: '110px' }}>
						<div className="d-flex justify-content-between align-items-start mb-3">
							<Skeleton width="90px" height="13px" />
							<Skeleton width="34px" height="34px" borderRadius="8px" />
						</div>
						<Skeleton width="120px" height="24px" className="mb-2" />
						<Skeleton width="70px" height="11px" />
					</div>
				</Col>
			))}
		</Row>

		{/* 3. Event Info Card */}
		<div className="card mb-4" style={{ padding: '20px 24px', minHeight: '180px' }}>
			<Skeleton width="110px" height="16px" className="mb-4" />
			<Row className="g-3 mb-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Col key={i} xs={12} sm={6} lg={4}>
						<Skeleton width="80px" height="10px" className="mb-2" />
						<Skeleton width="150px" height="14px" />
					</Col>
				))}
			</Row>
			<div className="divider" style={{ margin: '16px 0' }} />
			<div className="d-flex gap-2">
				<Skeleton width="100px" height="32px" borderRadius="6px" />
				<Skeleton width="125px" height="32px" borderRadius="6px" />
				<Skeleton width="115px" height="32px" borderRadius="6px" />
				<Skeleton width="105px" height="32px" borderRadius="6px" />
			</div>
		</div>

		{/* 4. Timeline */}
		<div className="card mb-4" style={{ padding: '20px 24px', minHeight: '80px' }}>
			<div className="d-flex justify-content-between">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="d-flex flex-column align-items-center"
						style={{ flex: 1 }}
					>
						<Skeleton width="20px" height="20px" borderRadius="50%" className="mb-2" />
						<Skeleton width="60px" height="12px" className="mb-2" />
						<Skeleton width="40px" height="10px" />
					</div>
				))}
			</div>
		</div>
	</div>
);


export default DashboardSkeleton