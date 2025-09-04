import { useState, useEffect } from 'react';
import { FiCheck, FiCopy, FiX } from 'react-icons/fi';

function Toast({ show, message, onClose, url }) {
  const [copied, setCopied] = useState(false);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.classList.contains('toast-container')) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [show, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [show, onClose]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!show) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        <div className="toast-content">
          <span className="success-icon">
            <FiCheck />
          </span>
          <div className="toast-message">
            <p>{message}</p>
            <div className="url-copy">
              <input 
                type="text" 
                value={url} 
                readOnly 
                onClick={(e) => e.target.select()}
              />
              <button onClick={copyToClipboard} className="copy-button">
                {copied ? 'Copied!' : (
                  <>
                    <FiCopy />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="close-button" 
          aria-label="Close"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
}

export default Toast;
