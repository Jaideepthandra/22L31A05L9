import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBarChart2, FiLink, FiClock, FiExternalLink, FiArrowLeft, 
  FiMapPin, FiGlobe, FiActivity, FiCalendar, FiHash 
} from 'react-icons/fi';
import '../App.css';

function Statistics() {
  const [urlStats, setUrlStats] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [activeUrls, setActiveUrls] = useState(0);

  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem('urlStats')) || [];
    const now = new Date();
    
    // Calculate total clicks and active URLs
    let clicks = 0;
    let active = 0;
    
    stats.forEach(url => {
      clicks += url.clicks;
      if (!url.expiryDate || new Date(url.expiryDate) > now) {
        active++;
      }
    });
    
    setTotalClicks(clicks);
    setActiveUrls(active);
    setUrlStats(stats);
  }, []);

  return (
    <div className="container">
      <nav className="nav">
        <Link to="/" className="back-link">
          <FiArrowLeft />
          Back to Shortener
        </Link>
        <h1><FiBarChart2 className="nav-icon" />URL Statistics</h1>
      </nav>

      <div className="stats-overview">
        <div className="overview-card">
          <FiHash className="overview-icon" />
          <div className="overview-content">
            <h3>Total URLs</h3>
            <p>{urlStats.length}</p>
          </div>
        </div>
        <div className="overview-card">
          <FiActivity className="overview-icon" />
          <div className="overview-content">
            <h3>Total Clicks</h3>
            <p>{totalClicks}</p>
          </div>
        </div>
        <div className="overview-card">
          <FiClock className="overview-icon" />
          <div className="overview-content">
            <h3>Active URLs</h3>
            <p>{activeUrls}</p>
          </div>
        </div>
      </div>

      <div className="stats-container">
        <h2>URL History</h2>
        {urlStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className="stat-title">
                <FiLink className="stat-icon" />
                <h3>Shortened URL</h3>
              </div>
              <a href={stat.shortUrl} target="_blank" rel="noopener noreferrer">
                {stat.shortUrl} <FiExternalLink className="link-icon" />
              </a>
            </div>
            <div className="stat-details">
              <p>
                <FiGlobe className="stat-icon" />
                <strong>Original URL:</strong> 
                <a href={stat.originalUrl} target="_blank" rel="noopener noreferrer" className="original-url">
                  {stat.originalUrl}
                </a>
              </p>
              <div className="stat-info-grid">
                <p>
                  <FiCalendar className="stat-icon" />
                  <strong>Created:</strong> {new Date(stat.createdAt).toLocaleString()}
                </p>
                {stat.expiryDate && (
                  <p>
                    <FiClock className="stat-icon" />
                    <strong>Expires:</strong> {new Date(stat.expiryDate).toLocaleString()}
                  </p>
                )}
                <p>
                  <FiActivity className="stat-icon" />
                  <strong>Total Clicks:</strong> {stat.clicks}
                </p>
              </div>
              
              {stat.clickData.length > 0 && (
                <div className="click-details">
                  <h4>
                    <FiBarChart2 className="stat-icon" />
                    Click Details
                  </h4>
                  <div className="click-list">
                    {stat.clickData.map((click, idx) => (
                      <div key={idx} className="click-item">
                        <p>
                          <FiClock className="stat-icon" />
                          <strong>Time:</strong> {new Date(click.timestamp).toLocaleString()}
                        </p>
                        <p>
                          <FiGlobe className="stat-icon" />
                          <strong>Source:</strong> {click.source}
                        </p>
                        <p>
                          <FiMapPin className="stat-icon" />
                          <strong>Location:</strong> {click.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;
