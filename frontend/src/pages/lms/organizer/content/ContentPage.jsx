import React from 'react';

const ContentPage = () => {
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
        <p>LMS Micro-Learning & SRL Framework - Content Management</p>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>[ Box: Sidebar / Context Area ]</h3>
          <p>Quick filters: Drafts, Published, Archived Modules.</p>
        </aside>

        <main style={styles.mainContent}>
          <h3>[ Box: Main Content Container ]</h3>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
            <button style={styles.button}>+ Add New Module</button>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Content Table Box ]</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Lessons Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td>MOD-001</td>
                  <td>SRL Foundations</td>
                  <td>4 Chunks</td>
                  <td><span style={{ padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}>Published</span></td>
                  <td>
                    <button style={{ padding: '2px 6px', marginRight: '5px' }}>Edit</button>
                    <button style={{ padding: '2px 6px' }}>Delete</button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td>MOD-002</td>
                  <td>Chunking Strategies</td>
                  <td>2 Chunks</td>
                  <td><span style={{ padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', backgroundColor: '#ffd' }}>Draft</span></td>
                  <td>
                    <button style={{ padding: '2px 6px', marginRight: '5px' }}>Edit</button>
                    <button style={{ padding: '2px 6px' }}>Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.box}>
            <h4>[ Box: CRUD Form Modal Box ]</h4>
            <div style={{ border: '1px solid #999', padding: '15px', backgroundColor: '#fff', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
              <h5>Add/Edit Module Config</h5>
              <label style={{ display: 'block', margin: '10px 0' }}>
                Module Title:
                <input type="text" style={{ width: '100%', padding: '5px' }} disabled />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                Module Description:
                <textarea style={{ width: '100%', padding: '5px' }} disabled />
              </label>
              <button style={{ padding: '5px 10px', backgroundColor: '#ddd', border: '1px solid #999' }}>Save</button>
            </div>
          </div>

          <div style={styles.box}>
            <h4>[ Box: Lesson-Quiz Mapping Area ]</h4>
            <p>Connect your micro-lessons with their matching validation quizzes.</p>
            <div style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff' }}>
              <span>Lesson: "Chunking Definition"</span>
              <span>⚡ maps to ⚡</span>
              <span>Quiz Q1: "Define chunking size limits"</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContentPage;
