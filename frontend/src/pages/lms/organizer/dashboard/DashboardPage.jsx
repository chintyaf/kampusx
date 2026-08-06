import React from 'react';

const DashboardPage = () => {
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      margin: '15px 0',
    },
    statCard: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '15px',
      backgroundColor: '#fff',
      textAlign: 'left',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>[ Box: Header / Top Bar ]</h2>
        <p>LMS Micro-Learning & SRL Framework - Organizer Dashboard</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
            <li><strong>LMS Studio</strong></li>
            <li>Content Management</li>
            <li>AI Prompt Helper</li>
            <li>Learning Path Config</li>
            <li>Settings & Logs</li>
          </ul>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.grid}>
            <div style={styles.statCard}>
              <h4>[ Card: Pass Rate ]</h4>
              <h2 style={{ margin: '5px 0' }}>87.4%</h2>
              <span style={{ fontSize: '12px', color: '#666' }}>Avg. Modules completed per user</span>
            </div>
            <div style={styles.statCard}>
              <h4>[ Card: Drop-off Rate ]</h4>
              <h2 style={{ margin: '5px 0' }}>12.6%</h2>
              <span style={{ fontSize: '12px', color: '#666' }}>Dropped during reflection phase</span>
            </div>
            <div style={styles.statCard}>
              <h4>[ Card: Active Learners ]</h4>
              <h2 style={{ margin: '5px 0' }}>420</h2>
              <span style={{ fontSize: '12px', color: '#666' }}>Active in the last 24 hours</span>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Module Effectiveness Table/Graph Box ]</h4>
            <div style={{ height: '200px', border: '1px solid #ccc', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0' }}>
              <span>[ Bar Chart Placeholder: Difficulty Index vs Completion Time ]</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th>Module Name</th>
                  <th>Success Rate</th>
                  <th>Reflection Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td>Introduction to SRL</td>
                  <td>94%</td>
                  <td>4.8 / 5.0</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td>Micro-Learning Basics</td>
                  <td>81%</td>
                  <td>4.1 / 5.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
