import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiLink, FiClock, FiCode, FiBarChart2, FiExternalLink } from 'react-icons/fi'
import Toast from './components/Toast'
import './App.css'

function App() {
  const [urls, setUrls] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastUrl, setToastUrl] = useState('')
  
  useEffect(() => {
    // Clear all URLs from localStorage when component mounts
    localStorage.removeItem('urlStats')
    setUrls([])
  }, [])

  const [formData, setFormData] = useState({
    url: '',
    validityPeriod: '',
    preferredCode: ''
  })
  const [error, setError] = useState('')

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateForm = () => {
    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL')
      return false
    }
    if (formData.validityPeriod && (isNaN(formData.validityPeriod) || formData.validityPeriod < 0)) {
      setError('Validity period must be a positive number')
      return false
    }
    if (formData.preferredCode && !/^[a-zA-Z0-9-_]+$/.test(formData.preferredCode)) {
      setError('Preferred code can only contain letters, numbers, hyphens, and underscores')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return

    try {
      // Set expiry date - default to 30 minutes if no validity period is given
      const validityPeriod = formData.validityPeriod || 30
      const expiryDate = new Date(Date.now() + validityPeriod * 60000).toISOString()

      // Check if we've reached the limit of 5 URLs
      if (urls.length >= 5) {
        setError('Maximum limit of 5 URLs reached')
        return
      }

      const shortCode = formData.preferredCode || Math.random().toString(36).substring(2, 8)
      const newShortUrl = {
        originalUrl: formData.url,
        shortUrl: `${window.location.origin}/${shortCode}`,
        createdAt: new Date().toISOString(),
        expiryDate,
        clicks: 0,
        clickData: []
      }

      const newUrls = [...urls, newShortUrl]
      setUrls(newUrls)
      localStorage.setItem('urlStats', JSON.stringify(newUrls))
      setFormData({ url: '', validityPeriod: '', preferredCode: '' })
      
      // Show the toast with the new shortened URL
      setToastUrl(newShortUrl.shortUrl)
      setShowToast(true)
    } catch (err) {
      setError('Failed to create shortened URL')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container">
      <nav className="nav">
        <h1><FiLink className="nav-icon" /> URL Shortener</h1>
        <Link to="/statistics" className="stats-link">
          <FiBarChart2 />
          View Statistics
        </Link>
      </nav>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <FiLink className="input-icon" />
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="Enter your URL here"
            required
            className="input"
          />
        </div>
        <div className="input-group">
          <FiClock className="input-icon" />
          <input
            type="number"
            name="validityPeriod"
            value={formData.validityPeriod}
            onChange={handleChange}
            placeholder="Validity period (minutes)"
            className="input"
          />
        </div>
        <div className="input-group">
          <FiCode className="input-icon" />
          <input
            type="text"
            name="preferredCode"
            value={formData.preferredCode}
            onChange={handleChange}
            placeholder="Preferred shortcode (optional)"
            className="input"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="button">
          Shorten URL
        </button>
      </form>

      <Toast 
        show={showToast}
        message="URL shortened successfully!"
        url={toastUrl}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default App
