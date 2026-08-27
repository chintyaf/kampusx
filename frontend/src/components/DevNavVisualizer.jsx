import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const DevNavVisualizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // List of all paths for the visualizer
  const routes = {
    learner: [
      { name: 'Onboarding', path: '/learner/onboarding' },
      { name: 'Catalog / Dashboard', path: '/learner/catalog' },
      { name: 'Module Detail (m1)', path: '/learner/modules/m1' },
      { name: 'Forethought (m1)', path: '/learner/modules/m1/forethought' },
      { name: 'Quiz (m1)', path: '/learner/modules/m1/quiz' },
      { name: 'Reflection (m1)', path: '/learner/modules/m1/reflection' },
      { name: 'Analytics', path: '/learner/analytics' },
      { name: 'Badges', path: '/learner/badges' },
      { name: 'Settings', path: '/learner/settings' },
    ]
  };

  const styles = {
    triggerButton: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 99999,
      padding: '10px 16px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    panel: {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      width: '320px',
      maxHeight: '80vh',
      overflowY: 'auto',
      backgroundColor: '#fff',
      border: '2px solid #333',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 99999,
      fontFamily: 'system-ui, sans-serif',
      padding: '15px',
      boxSizing: 'border-box'
    },
    title: {
      margin: '0 0 10px 0',
      fontSize: '16px',
      borderBottom: '2px solid #eee',
      paddingBottom: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#666',
      margin: '15px 0 5px 0'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    link: (isActive) => ({
      display: 'block',
      padding: '6px 10px',
      textDecoration: 'none',
      color: isActive ? '#fff' : '#333',
      backgroundColor: isActive ? '#333' : '#f0f0f0',
      borderRadius: '4px',
      fontSize: '13px',
      fontWeight: isActive ? 'bold' : 'normal',
      border: '1px solid #ccc',
      transition: 'background-color 0.2s',
      cursor: 'pointer'
    })
  };

  return (
    <>
      <button style={styles.triggerButton} onClick={() => setIsOpen(!isOpen)}>
        <span>🛠️</span> {isOpen ? 'Close Nav' : 'Dev Navigation'}
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.title}>
            <strong>LMS Dev Routes</strong>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>

          <div style={styles.sectionTitle}>Learner Domain</div>
          <ul style={styles.list}>
            {routes.learner.map((route) => {
              const isActive = location.pathname === route.path;
              return (
                <li key={route.path}>
                  <Link 
                    to={route.path} 
                    style={styles.link(isActive)}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.name} <code style={{ fontSize: '10px', float: 'right', opacity: 0.7 }}>{route.path}</code>
                  </Link>
                </li>
              );
            })}
          </ul>


        </div>
      )}
    </>
  );
};

export default DevNavVisualizer;
