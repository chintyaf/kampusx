import React from 'react';

const ReviewPage = () => {
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
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginTop: '15px',
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
        <p>LMS Micro-Learning & SRL Framework - AI Studio: Review & Publish</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Confidence score: <strong>94% AI Quality Match</strong></p>
          <p>Review the generated chunks before publishing them to the learner catalog.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={styles.grid}>
            <div style={styles.box}>
              <h4>[ Box: AI Generated Preview Box ]</h4>
              <div style={{ textAlign: 'left', backgroundColor: '#fff', border: '1px solid #ddd', padding: '15px', height: '250px', overflowY: 'auto' }}>
                <h5><strong>Preview: Lesson 1 (Chunk)</strong></h5>
                <p>Cognitive Load Theory limits learning to 3-4 information chunks at a time. The working memory is limited in capacity, meaning that designers must construct micro-lessons...</p>
                <h5><strong>Quiz Sample Q1</strong></h5>
                <p>What is the limitation capacity of the human working memory?</p>
              </div>
            </div>

            <div style={styles.box}>
              <h4>[ Box: Edit/Validation Form Box ]</h4>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>
                  <strong>Lesson Title:</strong>
                  <input type="text" defaultValue="Cognitive Load Constraints" style={{ width: '100%', padding: '6px' }} disabled />
                </label>
                <label>
                  <strong>Modify content description:</strong>
                  <textarea defaultValue="Modify generated details..." style={{ width: '100%', padding: '6px', height: '80px' }} disabled />
                </label>
                <button style={{ padding: '6px 12px', border: '1px solid #999', alignSelf: 'flex-start' }}>Apply Edits</button>
              </div>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Approve/Publish Actions ]</h4>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button style={{ ...styles.button, backgroundColor: '#faa' }}>Reject Generation</button>
              <button style={{ ...styles.button, backgroundColor: '#afa' }}>Approve & Publish to Catalog</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReviewPage;
