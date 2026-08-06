import React from 'react';
import { useParams } from 'react-router-dom';

const QuizPage = () => {
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
    optionCard: {
      border: '1px solid #bbb',
      borderRadius: '4px',
      padding: '12px',
      margin: '8px 0',
      backgroundColor: '#fff',
      textAlign: 'left',
      cursor: 'pointer',
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
        <p>LMS Micro-Learning & SRL Framework - Quiz Mode (Module ID: {moduleId || 'Default'})</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p><strong>Quiz Progress:</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginTop: '10px' }}>
            <span style={{ border: '1px solid #bbb', padding: '5px', textAlign: 'center', backgroundColor: '#ddd' }}>1</span>
            <span style={{ border: '1px solid #bbb', padding: '5px', textAlign: 'center', backgroundColor: '#fff' }}>2</span>
            <span style={{ border: '1px solid #bbb', padding: '5px', textAlign: 'center', backgroundColor: '#fff' }}>3</span>
          </div>
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>Time Remaining: 08:45</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Question Container Box (3 Soal) ]</h4>
            <div style={{ textAlign: 'left', marginTop: '10px' }}>
              <p><strong>Question 1 of 3:</strong> What is the core definition of "Self-Regulated Learning"?</p>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Answer Option Cards ]</h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={styles.optionCard}>
                <strong>Option A:</strong> A learning method where students have complete control over content generation.
              </div>
              <div style={styles.optionCard}>
                <strong>Option B:</strong> An active framework where learners plan, monitor, and reflect on their cognitive process.
              </div>
              <div style={styles.optionCard}>
                <strong>Option C:</strong> A school administration management methodology.
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Navigation Button Box ]</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button style={styles.button} disabled>&larr; Previous</button>
              <button style={styles.button}>Next Question &rarr;</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPage;
