import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import './index.css'
import App from './App.jsx'
import Statistics from './components/Statistics'

// Create a Redirect component for handling URL redirects
function Redirect() {
  useEffect(() => {
    const path = window.location.pathname.substring(1); // Remove leading slash
    const urlStats = JSON.parse(localStorage.getItem('urlStats')) || [];
    const urlData = urlStats.find(stat => stat.shortUrl.endsWith(path));
    
    // Get the processed flag from sessionStorage
    const processed = sessionStorage.getItem(`redirect-${path}`);
    
    if (urlData && !processed) {
      // Record the click data
      const newClickData = {
        timestamp: new Date().toISOString(),
        source: document.referrer || 'Direct',
        location: 'Unknown' // In a real app, you'd use a geolocation service
      };
      
      urlData.clicks += 1;
      urlData.clickData.push(newClickData);
      localStorage.setItem('urlStats', JSON.stringify(urlStats));
      
      // Mark this redirect as processed
      sessionStorage.setItem(`redirect-${path}`, 'true');
      
      // Redirect to the original URL
      window.location.href = urlData.originalUrl;
    } else if (!urlData) {
      // Redirect to home if URL not found
      window.location.href = '/';
    }
  }, []);
  
  return <div>Redirecting...</div>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/:shortCode" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
