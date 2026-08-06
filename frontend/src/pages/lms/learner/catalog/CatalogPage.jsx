import React from 'react';

const CatalogPage = () => {
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px',
      marginTop: '15px',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '15px',
      backgroundColor: '#fff',
      textAlign: 'left',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>[ Box: Header / Top Bar ]</h2>
        <p>LMS Micro-Learning & SRL Framework - Module Catalog</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Quick Filters & Learning Progress stats.</p>
          <ul>
            <li>Topics</li>
            <li>SRL Status</li>
            <li>Badges Earned</li>
          </ul>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: "Next Module" Banner Box ]</h4>
            <p><strong>Continue Learning:</strong> Module 3 - Forethought Phase</p>
            <button style={{ padding: '8px 16px', border: '1px solid #999', backgroundColor: '#eee', borderRadius: '4px', cursor: 'pointer' }}>
              Resume Module
            </button>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Search & Filter Box ]</h4>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <input type="text" placeholder="Search modules..." style={{ padding: '8px', width: '60%' }} disabled />
              <select style={{ padding: '8px' }} disabled>
                <option>All Difficulties</option>
              </select>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Modul Recommendation Grid ]</h4>
            <div style={styles.grid}>
              <div style={styles.card}>
                <h5>[ Card: Module 1 ]</h5>
                <p>Introduction to SRL (Self-Regulated Learning)</p>
                <span style={{ fontSize: '12px', color: '#666' }}>[ Box: SRL - Forethought ]</span>
              </div>
              <div style={styles.card}>
                <h5>[ Card: Module 2 ]</h5>
                <p>Micro-Learning Basics</p>
                <span style={{ fontSize: '12px', color: '#666' }}>[ Box: SRL - Performance ]</span>
              </div>
              <div style={styles.card}>
                <h5>[ Card: Module 3 ]</h5>
                <p>Advanced SRL Analytics</p>
                <span style={{ fontSize: '12px', color: '#666' }}>[ Box: SRL - Self-Reflection ]</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
