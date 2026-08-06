import React from 'react';

const BadgesPage = () => {
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px',
      marginTop: '15px',
    },
    badgeCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: '#fff',
      textAlign: 'center',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>[ Box: Header / Top Bar ]</h2>
        <p>LMS Micro-Learning & SRL Framework - Badges & Rewards</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Total Points: <strong>1,250 PTS</strong></p>
          <p>Rank: <strong>SRL Gold Master</strong></p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Stacking Progress Bar Box ]</h4>
            <p>Next Badge Progress: <strong>Planner Apprentice (3/4 modules set goal)</strong></p>
            <div style={{ border: '1px solid #ccc', height: '20px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: '#bbb', textAlign: 'center', fontSize: '12px', lineHeight: '20px' }}>
                75% Complete
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Badges Grid Box ]</h4>
            <div style={styles.grid}>
              <div style={styles.badgeCard}>
                <div style={{ fontSize: '32px' }}>🎯</div>
                <strong>Goal Setter</strong>
                <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 0' }}>Set 3 forethought goals.</p>
              </div>
              <div style={styles.badgeCard}>
                <div style={{ fontSize: '32px' }}>📝</div>
                <strong>Reflector</strong>
                <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 0' }}>Completed 3 reflections.</p>
              </div>
              <div style={styles.badgeCard}>
                <div style={{ fontSize: '32px' }}>⚡</div>
                <strong>Micro-Learner</strong>
                <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 0' }}>Completed 5 short-lessons.</p>
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Certificate Download Banner Box ]</h4>
            <div style={{ border: '1px solid #999', padding: '15px', backgroundColor: '#eee', borderRadius: '4px' }}>
              <h5>Congratulations! You have completed the SRL Foundations path.</h5>
              <button style={{ padding: '8px 16px', border: '1px solid #666', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                Download PDF Certificate
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BadgesPage;
