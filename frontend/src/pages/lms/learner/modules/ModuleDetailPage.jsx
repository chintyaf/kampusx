import React from 'react';
import { useParams } from 'react-router-dom';

const ModuleDetailPage = () => {
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
        <p>LMS Micro-Learning & SRL Framework - Module Detail (ID: {moduleId || 'Default'})</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p><strong>SRL Navigation:</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <span style={{ padding: '5px', border: '1px solid #bbb', backgroundColor: '#f0f0f0' }}>1. Forethought Phase (Goal Setting)</span>
            <span style={{ padding: '5px', border: '1px solid #bbb', backgroundColor: '#eee', fontWeight: 'bold' }}>2. Learning Content (Active)</span>
            <span style={{ padding: '5px', border: '1px solid #bbb', backgroundColor: '#f0f0f0' }}>3. Quiz/Assessment</span>
            <span style={{ padding: '5px', border: '1px solid #bbb', backgroundColor: '#f0f0f0' }}>4. Self-Reflection</span>
          </div>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Progress Bar Indicator ]</h4>
            <div style={{ border: '1px solid #ccc', height: '20px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#bbb', textAlign: 'center', fontSize: '12px', lineHeight: '20px' }}>
                60% Completed
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Video/Media Player Box ]</h4>
            <div style={{ width: '100%', height: '300px', border: '2px solid #aaa', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>[ Media Player Placeholder (Video/Audio/Slide) ]</span>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Content Description Box ]</h4>
            <div style={{ textAlign: 'left' }}>
              <h5>Module: Designing Micro-content chunks</h5>
              <p>In this lesson, you will learn the rules of micro-content chunking, cognitive load theory constraints, and how to apply them to your daily learning routine.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button style={styles.button}>&larr; Back to Forethought</button>
            <button style={styles.button}>Go to Quiz &rarr;</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModuleDetailPage;
