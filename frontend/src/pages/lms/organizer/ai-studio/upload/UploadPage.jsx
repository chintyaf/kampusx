import React from 'react';

const UploadPage = () => {
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
        <p>LMS Micro-Learning & SRL Framework - AI Studio: Upload Content</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>AI Studio helps you convert large reading materials (PDFs, PPTs, Docs) into micro-learning chunks automatically using SRL goals.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.box}>
            <h4>[ Box: Document Upload Area Box ]</h4>
            <div style={{ border: '2px dashed #ccc', padding: '40px', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
              <p>Drag and drop your PDF / Word files here or click to browse.</p>
              <span style={{ fontSize: '12px', color: '#888' }}>Max file size: 25MB (Formats: .pdf, .docx, .txt)</span>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: AI Prompt Parameter Form Box ]</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
              <label>
                <strong>Chunk Size Constraint:</strong>
                <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled>
                  <option>Micro-learning chunks (2-3 mins reading time)</option>
                  <option>Standard modules (5-10 mins reading time)</option>
                </select>
              </label>
              <label>
                <strong>Quiz Complexity Level:</strong>
                <select style={{ width: '100%', padding: '8px', marginTop: '5px' }} disabled>
                  <option>Recall (Conceptual definitions)</option>
                  <option>Application (Case study scenarios)</option>
                </select>
              </label>
              <label>
                <strong>AI System Prompt Directives:</strong>
                <textarea defaultValue="Act as a master instructor. Break down the content into a lesson, mapping it to specific forethought goals and building a quick self-reflection criteria." style={{ width: '100%', padding: '8px', height: '80px', marginTop: '5px' }} disabled />
              </label>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Process Button ]</h4>
            <button style={styles.button}>Generate Micro-learning Content</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UploadPage;
