import React from 'react';

const AnalyticsPage = () => {
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
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginTop: '15px',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>[ Box: Header / Top Bar ]</h2>
        <p>LMS Micro-Learning & SRL Framework - Learner Analytics</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>SRL metrics filter: Daily, Weekly, Monthly.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Learning Streak Card Box ]</h4>
            <div style={{ padding: '15px', border: '1px solid #ddd', backgroundColor: '#fff', display: 'inline-block', borderRadius: '4px' }}>
              <span style={{ fontSize: '24px' }}>🔥 <strong>5 Days Streak!</strong></span>
              <p style={{ margin: '5px 0 0 0' }}>Keep it up to unlock the "Active Planner" badge.</p>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.box}>
              <h4>[ Box: Skill Radar Chart Box ]</h4>
              <div style={{ height: '150px', border: '1px solid #ccc', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>[ Radar Chart Placeholder: planning, reflection, memory, accuracy ]</span>
              </div>
            </div>

            <div style={styles.box}>
              <h4>[ Box: Progress Overtime Graph Box ]</h4>
              <div style={{ height: '150px', border: '1px solid #ccc', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>[ Line Chart Placeholder: completion rate vs self-efficacy ]</span>
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: History List Box ]</h4>
            <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
              <li style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>✓ Module 2 Completed - 2 hours ago</li>
              <li style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>✓ Module 1 Completed - Yesterday</li>
              <li style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>✓ Personalization onboarding - 2 days ago</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
