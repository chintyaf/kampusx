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
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '15px',
      marginTop: '15px',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '15px',
      backgroundColor: '#fff',
      textAlign: 'left',
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
        <p>LMS Micro-Learning & SRL Framework - Badge & Certificate Configuration</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Gamification configuration settings. Adjust learning motivation rules here.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
            <button style={styles.button}>+ Create Custom Badge</button>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Badge CRUD Grid Box ]</h4>
            <div style={styles.grid}>
              <div style={styles.card}>
                <h5>🎯 Goal Setter Badge</h5>
                <p style={{ fontSize: '12px' }}>Completing 3 forethought planning forms.</p>
                <div style={{ marginTop: '10px' }}>
                  <button style={{ padding: '3px 6px', marginRight: '5px' }}>Edit</button>
                  <button style={{ padding: '3px 6px' }}>Delete</button>
                </div>
              </div>
              <div style={styles.card}>
                <h5>🔥 Consistency King</h5>
                <p style={{ fontSize: '12px' }}>Maintain a 5-day active learning streak.</p>
                <div style={{ marginTop: '10px' }}>
                  <button style={{ padding: '3px 6px', marginRight: '5px' }}>Edit</button>
                  <button style={{ padding: '3px 6px' }}>Delete</button>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Stacking Rules Builder Box ]</h4>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px', margin: '0 auto' }}>
              <label>
                <strong>Rules Configuration Name:</strong>
                <input type="text" defaultValue="Planner Progression Track" style={{ width: '100%', padding: '6px' }} disabled />
              </label>
              <label>
                <strong>Triggers condition stack:</strong>
                <select style={{ width: '100%', padding: '6px' }} disabled>
                  <option>Goal Setter + Consistency King (Unlocks "Super Planner" Rank)</option>
                  <option>Completion of 5 quizzes above passing rate (Unlocks "Acuracy Maestro")</option>
                </select>
              </label>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Certificate Template Designer Box ]</h4>
            <div style={{ border: '1px solid #ccc', backgroundColor: '#fff', padding: '30px', margin: '15px 0' }}>
              <div style={{ border: '2px solid #aaa', padding: '20px', minHeight: '150px' }}>
                <h5>[ Template Canvas Placeholder ]</h5>
                <p>CERTIFICATE OF ACHIEVEMENT</p>
                <p style={{ fontSize: '12px', color: '#666' }}>This certificate is proudly presented to: <strong>{"{{ LearnerName }}"}</strong></p>
                <p style={{ fontSize: '12px', color: '#666' }}>For completing path: <strong>{"{{ PathTitle }}"}</strong></p>
              </div>
              <button style={{ ...styles.button, marginTop: '15px' }}>Edit Template Variables</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BadgesPage;
