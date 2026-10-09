import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

// Import Modular Learning Components
import LearningHeader from '../components/learning/LearningHeader';
import WeeklyGoalCard from '../components/learning/WeeklyGoalCard';
import ContinueLearningCard from '../components/learning/ContinueLearningCard';
import RecommendedModules from '../components/learning/RecommendedModules';
import EnrolledModules from '../components/learning/EnrolledModules';
import LearningReadinessWidget from '../components/learning/LearningReadinessWidget';
import QuizFeedbackWidget from '../components/learning/QuizFeedbackWidget';
import BadgesWidget from '../components/learning/BadgesWidget';

// Import Mock Data
import {
  mockUserLearningProfile,
  mockWeeklyGoal,
  mockContinueLearning,
  mockRecommendedModules,
  mockEnrolledModules,
  mockLearningReadiness,
  mockQuizFeedback,
  mockBadgesAndCredentials,
} from '../data/learningMockData';

// Custom CSS for Learning Dashboard
import '../styles/learningDashboard.css';

/**
 * LearningDashboard
 * Main page container for KampusX Microlearning Dashboard.
 * Integrates Bootstrap 5 Grid System (container, row, col-lg-8, col-lg-4)
 * with a high-polish modular architecture.
 */
const LearningDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="learning-dashboard-wrapper">
      <Container className="py-4">
        {/* A. Top Header Area */}
        <LearningHeader
          user={user}
          streak={mockUserLearningProfile.currentStreak}
          xp={mockUserLearningProfile.totalXp}
        />

        {/* Main Grid: col-lg-8 (Main Content) and col-lg-4 (Right Sidebar) */}
        <Row className="g-4">
          {/* =============================================================
              B. Main Content Area (Bootstrap col-lg-8)
             ============================================================= */}
          <Col lg={8}>
            {/* 1. Weekly Goal Card */}
            <WeeklyGoalCard data={mockWeeklyGoal} />

            {/* 2. Continue Learning Card */}
            <ContinueLearningCard module={mockContinueLearning} />

            {/* 3. Recommended Modules (3-column grid) */}
            <RecommendedModules modules={mockRecommendedModules} />

            {/* 4. My Enrolled Modules with Tabs */}
            <EnrolledModules modules={mockEnrolledModules} />
          </Col>

          {/* =============================================================
              C. Right Sidebar Area (Bootstrap col-lg-4)
             ============================================================= */}
          <Col lg={4}>
            {/* 1. Learning Readiness Widget (SRL Circular Radial Gauge) */}
            <LearningReadinessWidget readiness={mockLearningReadiness} />

            {/* 2. Recent Quiz Feedback Widget */}
            <QuizFeedbackWidget feedback={mockQuizFeedback} />

            {/* 3. Badges & Credentials Widget */}
            <BadgesWidget data={mockBadgesAndCredentials} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LearningDashboard;
