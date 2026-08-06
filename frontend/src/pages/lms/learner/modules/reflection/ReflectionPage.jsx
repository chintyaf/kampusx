import React from 'react';
import { useParams } from 'react-router-dom';

const ReflectionPage = () => {
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
        <p>LMS Micro-Learning & SRL Framework - Self-Reflection Phase (Module ID: {moduleId || 'Default'})</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p><strong>SRL Concept:</strong> Self-reflection is where the learner evaluates their confidence, reviews feedback, and identifies adjustments for future learning sessions.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Self-Confidence Rating Box ]</h4>
            <p>How confident are you in applying this knowledge?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0' }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button key={num} style={{ padding: '8px 16px', border: '1px solid #999', borderRadius: '4px', backgroundColor: '#fff' }} disabled>
                  {num} Star
                </button>
              ))}
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Readiness Score Badge Box ]</h4>
            <div style={{ padding: '10px', backgroundColor: '#eee', display: 'inline-block', borderRadius: '50px', width: '100px', height: '100px', lineHeight: '80px' }}>
              <strong>92/100</strong>
            </div>
            <p style={{ marginTop: '10px' }}>Your readiness level is <strong>High</strong> for the next topic.</p>
          </div>

          <div style={styles.box}>
            <h4>[ Box: AI Feedback Summary Box ]</h4>
            <div style={{ border: '1px solid #ddd', padding: '15px', backgroundColor: '#fff', textAlign: 'left' }}>
              <p><em>"Excellent work! You showed strong understanding of cognitive constraints. In your next session, try to write down key takeaways earlier during the forethought phase."</em></p>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Action Button Box ]</h4>
            <button style={styles.button}>Selesaikan Modul (Complete Module)</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReflectionPage;
