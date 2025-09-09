import React, { useState, useEffect } from 'react'
import apiService from '../services/api'

const ServiceStatus = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await apiService.getServices()
      setServices(data.transcription.services || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="service-status">
        <h3>Checking service status...</h3>
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="service-status error">
        <h3>⚠️ Service Status Error</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={loadServices}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="service-status">
      <h3>🤖 AI Services Status</h3>
      <div className="services-grid">
        {services.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </div>

      {services.length === 0 && (
        <div className="no-services">
          <p>No AI transcription services are currently configured.</p>
          <p>Please configure at least one service in your environment variables.</p>
        </div>
      )}

      <style jsx>{`
        .service-status {
          margin-bottom: 2rem;
        }

        .service-status h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .no-services {
          text-align: center;
          padding: 2rem;
          background: var(--bg-card);
          border-radius: 12px;
          color: var(--text-muted);
        }

        .service-status.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .service-status.error h3 {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .service-status.error p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}

const ServiceCard = ({ service }) => {
  const getServiceEmoji = (name) => {
    const nameLC = name.toLowerCase()
    if (nameLC.includes('openai') || nameLC.includes('whisper')) return '🤖'
    if (nameLC.includes('assemblyai')) return '🎯'
    if (nameLC.includes('gemini')) return '💎'
    if (nameLC.includes('elevenlabs')) return '🔊'
    return '⚡'
  }

  return (
    <div className="service-card">
      <div className="service-header">
        <span className="service-emoji">{getServiceEmoji(service.name)}</span>
        <div className="service-info">
          <h4>{service.name}</h4>
          <span className={`status-indicator ${service.ready ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {service.ready ? 'Ready' : 'Not Configured'}
          </span>
        </div>
      </div>

      {service.features && service.features.length > 0 && (
        <div className="service-features">
          <span className="features-label">Features:</span>
          <div className="features-list">
            {service.features.map((feature, index) => (
              <span key={index} className="feature-tag">
                {feature.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .service-card {
          background: var(--bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all var(--animation-normal);
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .service-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .service-emoji {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .service-info {
          flex: 1;
        }

        .service-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-weight: 600;
        }

        .service-features {
          margin-top: 1rem;
        }

        .features-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
          display: block;
          margin-bottom: 0.5rem;
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .feature-tag {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  )
}

export default ServiceStatus
