import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, Cloud, AlertCircle, ChevronDown, ChevronRight, ExternalLink, Download } from 'lucide-react';

// Sample CloudTrail data structure
const sampleEvents = [
  {
    id: '1',
    timestamp: '2026-01-22T14:23:45Z',
    eventName: 'DeleteBucket',
    eventSource: 's3.amazonaws.com',
    userIdentity: {
      type: 'IAMUser',
      userName: 'alice.johnson',
      arn: 'arn:aws:iam::123456789012:user/alice.johnson'
    },
    requestParameters: { bucketName: 'production-data-archive' },
    sourceIPAddress: '203.0.113.42',
    region: 'us-east-1',
    errorCode: null,
    riskLevel: 'high'
  },
  {
    id: '2',
    timestamp: '2026-01-22T13:15:22Z',
    eventName: 'PutBucketPolicy',
    eventSource: 's3.amazonaws.com',
    userIdentity: {
      type: 'IAMUser',
      userName: 'bob.smith',
      arn: 'arn:aws:iam::123456789012:user/bob.smith'
    },
    requestParameters: { bucketName: 'public-assets', policy: '{"Version":"2012-10-17"...}' },
    sourceIPAddress: '198.51.100.17',
    region: 'us-west-2',
    errorCode: null,
    riskLevel: 'medium'
  },
  {
    id: '3',
    timestamp: '2026-01-22T12:08:33Z',
    eventName: 'CreateAccessKey',
    eventSource: 'iam.amazonaws.com',
    userIdentity: {
      type: 'IAMUser',
      userName: 'charlie.davis',
      arn: 'arn:aws:iam::123456789012:user/charlie.davis'
    },
    requestParameters: { userName: 'service-account-prod' },
    sourceIPAddress: '192.0.2.89',
    region: 'us-east-1',
    errorCode: null,
    riskLevel: 'medium'
  },
  {
    id: '4',
    timestamp: '2026-01-22T11:45:18Z',
    eventName: 'ModifyDBInstance',
    eventSource: 'rds.amazonaws.com',
    userIdentity: {
      type: 'AssumedRole',
      userName: 'DevOpsRole',
      arn: 'arn:aws:sts::123456789012:assumed-role/DevOpsRole/session123'
    },
    requestParameters: { 
      dBInstanceIdentifier: 'prod-database-01',
      publiclyAccessible: true 
    },
    sourceIPAddress: '203.0.113.156',
    region: 'eu-west-1',
    errorCode: null,
    riskLevel: 'high'
  },
  {
    id: '5',
    timestamp: '2026-01-22T10:32:05Z',
    eventName: 'AuthorizeSecurityGroupIngress',
    eventSource: 'ec2.amazonaws.com',
    userIdentity: {
      type: 'IAMUser',
      userName: 'diana.martinez',
      arn: 'arn:aws:iam::123456789012:user/diana.martinez'
    },
    requestParameters: { 
      groupId: 'sg-0123456789abcdef0',
      ipPermissions: [{ ipProtocol: 'tcp', fromPort: 22, toPort: 22, ipRanges: ['0.0.0.0/0'] }]
    },
    sourceIPAddress: '198.51.100.234',
    region: 'us-east-1',
    errorCode: null,
    riskLevel: 'high'
  },
  {
    id: '6',
    timestamp: '2026-01-22T09:18:47Z',
    eventName: 'PutObject',
    eventSource: 's3.amazonaws.com',
    userIdentity: {
      type: 'IAMUser',
      userName: 'alice.johnson',
      arn: 'arn:aws:iam::123456789012:user/alice.johnson'
    },
    requestParameters: { bucketName: 'config-backups', key: 'backup-2026-01-22.tar.gz' },
    sourceIPAddress: '203.0.113.42',
    region: 'us-east-1',
    errorCode: null,
    riskLevel: 'low'
  },
  {
    id: '7',
    timestamp: '2026-01-22T08:55:12Z',
    eventName: 'UpdateFunctionConfiguration',
    eventSource: 'lambda.amazonaws.com',
    userIdentity: {
      type: 'AssumedRole',
      userName: 'AdminRole',
      arn: 'arn:aws:sts::123456789012:assumed-role/AdminRole/admin-session'
    },
    requestParameters: { 
      functionName: 'ProcessPayments',
      environment: { variables: { API_KEY: 'new-key-value' } }
    },
    sourceIPAddress: '192.0.2.145',
    region: 'us-west-2',
    errorCode: null,
    riskLevel: 'medium'
  },
  {
    id: '8',
    timestamp: '2026-01-22T07:22:38Z',
    eventName: 'DeleteDBSnapshot',
    eventSource: 'rds.amazonaws.com',
    userIdentity: {
      type: 'IAMUser',
      userName: 'bob.smith',
      arn: 'arn:aws:iam::123456789012:user/bob.smith'
    },
    requestParameters: { dBSnapshotIdentifier: 'prod-db-snapshot-2026-01-15' },
    sourceIPAddress: '198.51.100.17',
    region: 'us-west-2',
    errorCode: null,
    riskLevel: 'high'
  }
];

const CloudTrailInvestigator = () => {
  const [events, setEvents] = useState(sampleEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    eventSource: 'all',
    user: 'all',
    timeRange: '24h'
  });

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userIdentity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventSource.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = filters.riskLevel === 'all' || event.riskLevel === filters.riskLevel;
      const matchesSource = filters.eventSource === 'all' || event.eventSource === filters.eventSource;
      const matchesUser = filters.user === 'all' || event.userIdentity.userName === filters.user;
      
      return matchesSearch && matchesRisk && matchesSource && matchesUser;
    });
  }, [events, searchTerm, filters]);

  // Get unique values for filters
  const uniqueServices = [...new Set(events.map(e => e.eventSource))];
  const uniqueUsers = [...new Set(events.map(e => e.userIdentity.userName))];

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return 'var(--risk-high)';
      case 'medium': return 'var(--risk-medium)';
      case 'low': return 'var(--risk-low)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      color: 'var(--text-primary)'
    }}>
      <style>{`
        :root {
          --bg-primary: #0a0e1a;
          --bg-secondary: #131820;
          --bg-tertiary: #1a2030;
          --bg-hover: #212938;
          --border: #2a3548;
          --text-primary: #e8edf4;
          --text-secondary: #8b95a8;
          --text-muted: #5a6476;
          --accent: #00d4ff;
          --accent-dim: #0088aa;
          --risk-high: #ff3366;
          --risk-medium: #ffaa00;
          --risk-low: #00cc88;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          animation: slideIn 0.5s ease-out;
        }

        .header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--border);
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 120px;
          height: 2px;
          background: var(--accent);
          animation: pulse 2s ease-in-out infinite;
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--accent) 0%, #00ff88 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .controls {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        input, select {
          width: 100%;
          padding: 12px 12px 12px 40px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 13px;
          transition: all 0.2s;
        }

        select {
          padding-left: 12px;
          cursor: pointer;
        }

        input:focus, select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        input::placeholder {
          color: var(--text-muted);
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: var(--accent-dim);
          transform: translateY(-2px);
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .events-list {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .event-item {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }

        .event-item:last-child {
          border-bottom: none;
        }

        .event-item:hover {
          background: var(--bg-hover);
        }

        .event-item.selected {
          background: var(--bg-tertiary);
          border-left: 3px solid var(--accent);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .event-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .event-time {
          font-size: 12px;
          color: var(--text-muted);
        }

        .event-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .meta-item svg {
          width: 14px;
          height: 14px;
        }

        .risk-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 24px;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
          position: sticky;
          top: 24px;
        }

        .detail-panel::-webkit-scrollbar {
          width: 8px;
        }

        .detail-panel::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
        }

        .detail-panel::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        .detail-panel::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        .detail-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .detail-value {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          word-break: break-all;
        }

        .json-viewer {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 12px;
          font-size: 12px;
          overflow-x: auto;
          color: var(--text-secondary);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: var(--text-muted);
          text-align: center;
        }

        .empty-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .btn {
          padding: 8px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn:hover {
          background: var(--bg-hover);
          border-color: var(--accent);
        }

        .btn svg {
          width: 14px;
          height: 14px;
        }

        @media (max-width: 1200px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .detail-panel {
            position: relative;
            top: 0;
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .controls {
            grid-template-columns: 1fr;
          }
          
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <div className="title">CLOUDTRAIL INVESTIGATOR</div>
          <div className="subtitle">AWS Activity Monitoring & Forensics Platform</div>
        </div>

        <div className="controls">
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search events, users, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filters.riskLevel} 
            onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <select 
            value={filters.eventSource} 
            onChange={(e) => setFilters({...filters, eventSource: e.target.value})}
          >
            <option value="all">All Services</option>
            {uniqueServices.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          <select 
            value={filters.user} 
            onChange={(e) => setFilters({...filters, user: e.target.value})}
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <select 
            value={filters.timeRange} 
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{filteredEvents.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">High Risk</div>
            <div className="stat-value" style={{ color: 'var(--risk-high)' }}>
              {filteredEvents.filter(e => e.riskLevel === 'high').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unique Users</div>
            <div className="stat-value">
              {new Set(filteredEvents.map(e => e.userIdentity.userName)).size}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Services</div>
            <div className="stat-value">
              {new Set(filteredEvents.map(e => e.eventSource)).size}
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="events-list">
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <AlertCircle />
                <div>No events found matching your criteria</div>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className={`event-item ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="event-header">
                    <div className="event-name">{event.eventName}</div>
                    <div className="event-time">{formatTimestamp(event.timestamp)}</div>
                  </div>
                  <div className="event-meta">
                    <div className="meta-item">
                      <User size={14} />
                      {event.userIdentity.userName}
                    </div>
                    <div className="meta-item">
                      <Cloud size={14} />
                      {event.eventSource.split('.')[0].toUpperCase()}
                    </div>
                    <span 
                      className="risk-badge"
                      style={{ 
                        background: `${getRiskColor(event.riskLevel)}22`,
                        color: getRiskColor(event.riskLevel)
                      }}
                    >
                      {event.riskLevel} risk
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="detail-panel">
            {selectedEvent ? (
              <>
                <div className="detail-title">{selectedEvent.eventName}</div>
                
                <div className="detail-section">
                  <div className="detail-label">Event Time</div>
                  <div className="detail-value">{new Date(selectedEvent.timestamp).toLocaleString()}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">User Identity</div>
                  <div className="detail-value">
                    <strong>Type:</strong> {selectedEvent.userIdentity.type}<br/>
                    <strong>Name:</strong> {selectedEvent.userIdentity.userName}<br/>
                    <strong>ARN:</strong> {selectedEvent.userIdentity.arn}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Event Source</div>
                  <div className="detail-value">{selectedEvent.eventSource}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Region</div>
                  <div className="detail-value">{selectedEvent.region}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Source IP</div>
                  <div className="detail-value">{selectedEvent.sourceIPAddress}</div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Risk Level</div>
                  <span 
                    className="risk-badge"
                    style={{ 
                      background: `${getRiskColor(selectedEvent.riskLevel)}22`,
                      color: getRiskColor(selectedEvent.riskLevel)
                    }}
                  >
                    {selectedEvent.riskLevel} risk
                  </span>
                </div>

                <div className="detail-section">
                  <div className="detail-label">Request Parameters</div>
                  <div className="json-viewer">
                    <pre>{JSON.stringify(selectedEvent.requestParameters, null, 2)}</pre>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn">
                    <ExternalLink />
                    View in Console
                  </button>
                  <button className="btn">
                    <Download />
                    Export Event
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <AlertCircle />
                <div>Select an event to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudTrailInvestigator;