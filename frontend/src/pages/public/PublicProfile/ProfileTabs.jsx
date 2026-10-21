import React from 'react';
import { Award, Brain, Sparkles, Calendar } from 'lucide-react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="profile-tabs-bar">
      <button
        type="button"
        className={`profile-tab-item ${activeTab === 'sbt' ? 'active' : ''}`}
        onClick={() => onTabChange('sbt')}
      >
        <Award size={16} />
        <span>Sertifikat & SBT On-Chain</span>
      </button>

      <button
        type="button"
        className={`profile-tab-item ${activeTab === 'skills' ? 'active' : ''}`}
        onClick={() => onTabChange('skills')}
      >
        <Brain size={16} />
        <span>Matriks Keahlian & SRL</span>
      </button>

      <button
        type="button"
        className={`profile-tab-item ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => onTabChange('activity')}
      >
        <Sparkles size={16} />
        <span>Aktivitas & Post</span>
      </button>

      <button
        type="button"
        className={`profile-tab-item ${activeTab === 'events' ? 'active' : ''}`}
        onClick={() => onTabChange('events')}
      >
        <Calendar size={16} />
        <span>Histori Event</span>
      </button>
    </div>
  );
};

export default ProfileTabs;
