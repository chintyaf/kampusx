import React from 'react';
import { useParams } from 'react-router-dom';

const ForethoughtPage = () => {
  const { moduleId } = useParams();

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#333',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
    },
    header: {
      border: '2px dashed #666',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#fff',
      textAlign: 'center',
    },
    layout: {
      display: 'flex',
      gap: '20px',
    },
    sidebar: {
      border: '2px dashed #666',
      borderRadius: '8px',
      padding: '20px',
      width: '250px',
      backgroundColor: '#fff',
    },
    mainContent: {
      border: '2px dashed #666',
      borderRadius: '8px',
      padding: '20px',
      flex: 1,
      backgroundColor: '#fff',
    },
    box: {
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '20px',
      margin: '15px 0',
      backgroundColor: '#fafafa',
      textAlign: 'center',
    },
    button: {
      padding: '10px 20px',
      border: '1px solid #999',
      backgroundColor: '#eee',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>[ Box: Header / Top Bar ]</h2>
        <p>LMS Micro-Learning & SRL Framework - Forethought Phase (Module ID: {moduleId || 'Default'})</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p><strong>SRL Concept:</strong> Forethought is the planning phase where learners establish goals and estimate their task resources before studying.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>
          <p>Prepare yourself before starting this module by defining your targets.</p>

          <div style={styles.box}>
            <h4>[ Box: Goal Setting Form Box ]</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
              <label>
                <strong>What is your primary goal for this session?</strong>
                <input type="text" placeholder="e.g. Master the concept of chunking" style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled />
              </label>
              <label>
                <strong>What strategies will you use to remain focused?</strong>
                <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled>
                  <option>Pomodoro technique (25m study, 5m break)</option>
                  <option>Distraction-free environment</option>
                  <option>Take detailed summaries</option>
                </select>
              </label>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Time Estimation Slider/Input Box ]</h4>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <p>Estimated time to complete: <strong>30 Minutes</strong></p>
              <input type="range" min="5" max="120" defaultValue="30" style={{ width: '100%' }} disabled />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>5 mins</span>
                <span>120 mins</span>
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Start Button Box ]</h4>
            <button style={styles.button}>Mulai Belajar (Start Learning &rarr;)</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForethoughtPage;
