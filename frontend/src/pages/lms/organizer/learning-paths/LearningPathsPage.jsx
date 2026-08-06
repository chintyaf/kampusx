import React from 'react';

const LearningPathsPage = () => {
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
      padding: '8px 16px',
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
        <p>LMS Micro-Learning & SRL Framework - Learning Paths Configuration</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Define sequential prerequisite validation paths here. Ensure learners cannot proceed to next phases without completing current reflection steps.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Prerequisite Dependency Graph Canvas Box ]</h4>
            <div style={{ height: '300px', border: '2px dashed #999', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span>[ Graph Canvas: Node Editor Placeholder ]</span>
              <div style={{ position: 'absolute', display: 'flex', gap: '15px' }}>
                <span style={{ border: '1px solid #666', padding: '10px', backgroundColor: '#f0f0f0' }}>Module 1 (SRL Intro)</span>
                <span>➔</span>
                <span style={{ border: '1px solid #666', padding: '10px', backgroundColor: '#f0f0f0' }}>Module 2 (Time Planning)</span>
                <span>➔</span>
                <span style={{ border: '1px solid #666', padding: '10px', backgroundColor: '#eee' }}>Module 3 (Self-Reflection)</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Double click canvas to add connection node. Right click to delete edge.</p>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Passing Grade Config Box ]</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
              <label>
                <strong>Min. Quiz Passing Grade to Unlock Next Module:</strong>
                <input type="number" defaultValue="80" style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled />
              </label>
              <label>
                <strong>Required SRL Self-Confidence Star Rating:</strong>
                <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled>
                  <option>Any rating triggers completion</option>
                  <option>Min. 3 Star Self-confidence rating required</option>
                  <option>Min. 4 Star Self-confidence rating required</option>
                </select>
              </label>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Save Button ]</h4>
            <button style={styles.button}>Simpan Aturan Path (Save Path Rules)</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPathsPage;
