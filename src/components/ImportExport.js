import React, { useRef } from 'react';
import useStore from '../store/useStore';
import styles from './ImportExport.module.css';

const ImportExport = () => {
  const library = useStore((state) => state.library);
  const updateLibrary = useStore((state) => state.updateLibrary);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(library, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `media_tracker_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        
        // Basic schema validation
        if (!parsed.anime || !parsed.movies || !parsed.tv) {
          throw new Error("Invalid JSON structure. Missing core categories (anime, movies, tv).");
        }
        
        if (window.confirm("This will overwrite your current cloud library. Proceed?")) {
          await updateLibrary(parsed);
          alert("Library successfully imported and synced!");
        }
      } catch (err) {
        alert("Failed to import JSON: " + err.message);
      }
      // Reset input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3>Data Portability</h3>
        <p>Your data belongs to you. Export your library for safekeeping or import a previous backup. Modifying data locally and re-importing also works.
          EXPORT KRLO KALKO UDD GAYA TO MEREPASS MTT AANA.
        </p>
        <div className={styles.actions}>
          <button onClick={handleExport} className={styles.exportBtn}>
            Export to JSON
          </button>
          
          <button onClick={() => fileInputRef.current.click()} className={styles.importBtn}>
            Import from JSON
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ImportExport;