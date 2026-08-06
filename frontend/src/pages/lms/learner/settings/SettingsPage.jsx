import React from 'react';

const SettingsPage = () => {
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
        <p>LMS Micro-Learning & SRL Framework - Settings</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <ul style={{ paddingLeft: '20px', textAlign: 'left' }}>
            <li>Profile Details</li>
            <li>Learning Reminders</li>
            <li>API Integrations</li>
          </ul>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: User Preference Form Box ]</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
              <label>
                <strong>Daily Study Reminder:</strong>
                <input type="time" defaultValue="09:00" style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled />
              </label>
              <label>
                <strong>SRL Reflection Mode:</strong>
                <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled>
                  <option>Detailed (Post-Quiz questionnaire)</option>
                  <option>Quick (Star Rating & Feedback only)</option>
                </select>
              </label>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Interest Selection Box ]</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', margin: '10px 0' }}>
              {['Artificial Intelligence', 'Software Architecture', 'UX Design', 'Product Management', 'Data Engineering'].map((topic) => (
                <span key={topic} style={{ border: '1px solid #ccc', padding: '5px 10px', borderRadius: '20px', backgroundColor: '#fff', fontSize: '13px' }}>
                  {topic} ✕
                </span>
              ))}
            </div>
            <button style={{ padding: '5px 10px', border: '1px solid #999', backgroundColor: '#eee', borderRadius: '4px' }}>Add Interests</button>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Save Button ]</h4>
            <button style={styles.button}>Simpan Perubahan (Save Changes)</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
