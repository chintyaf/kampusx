import React from 'react';

const OnboardingPage = () => {
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
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '800px',
      margin: '0 auto',
    },
    sidebar: {
      border: '2px dashed #666',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
    },
    mainContent: {
      border: '2px dashed #666',
      borderRadius: '8px',
      padding: '20px',
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
      cursor: 'pointer',
      borderRadius: '4px',
      fontWeight: 'bold',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>[ Box: Header / Top Bar ]</h2>
        <p>LMS Micro-Learning & SRL Framework - Learner Onboarding</p>
      </header>

      <div style={styles.layout}>
        <div style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>
          <p>Please complete your onboarding profile to personalize your learning path.</p>

          <div style={styles.box}>
            <h4>[ Box: Form Container - Personalization Details ]</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
              <label>
                <strong>Program Studi:</strong>
                <input type="text" placeholder="e.g. Teknik Informatika" style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled />
              </label>
              <label>
                <strong>Kampus:</strong>
                <input type="text" placeholder="e.g. Universitas X" style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled />
              </label>
              <label>
                <strong>Topik Minat (Interest Topics):</strong>
                <textarea placeholder="e.g. Web Development, UI/UX Design" style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled />
              </label>
            </div>
          </div>

          <div style={{ ...styles.box, display: 'flex', justifyContent: 'center' }}>
            <div>
              <h4>[ Box: Action Button Box ]</h4>
              <button style={styles.button}>Mulai Belajar (Start Learning)</button>
            </div>
          </div>
        </div>

        <div style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Onboarding steps and SRL (Self-Regulated Learning) Tips: Goal-setting starts here!</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
