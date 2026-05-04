import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const upcomingMatches = [
    {
      id: 1,
      group: 'GROUP A',
      date: 'SATURDAY 1, GROUP A',
      time: '6 JUNE 11, 2026 • 16:00 CST',
      team1: { name: 'Mexico', code: 'MEX', flag: '🇲🇽' },
      team2: { name: 'England', code: 'ENG', flag: '🇬🇧' },
    },
    {
      id: 2,
      group: 'GROUP A',
      date: 'SATURDAY 1, GROUP A',
      time: '6 JUNE 11, 2026 • 16:00 EST',
      team1: { name: 'USA', code: 'USA', flag: '🇺🇸' },
      team2: { name: 'Germany', code: 'GER', flag: '🇩🇪' },
    },
    {
      id: 3,
      group: 'GROUP A',
      date: 'SATURDAY 1, GROUP A',
      time: '6 JUNE 12, 2026 • 19:00 PST',
      team1: { name: 'Canada', code: 'CAN', flag: '🇨🇦' },
      team2: { name: 'Brazil', code: 'BRA', flag: '🇧🇷' },
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1>⚽ WC2026</h1>
          <p className="text-muted">Bienvenido, {user?.nombre}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
          Cerrar Sesión
        </button>
      </div>

      {/* Quick Access Cards */}
      <div className="quick-access-section">
        <div className="row g-3">
          {/* Stadiums Card */}
          <div className="col-md-4">
            <div className="quick-card stadiums-card" onClick={() => navigate('/stadiums')}>
              <div className="card-icon">📍</div>
              <h3>Stadiums</h3>
              <p>Explore the 12 architectural marvels across North America</p>
              <div className="card-badge">12</div>
            </div>
          </div>

          {/* Superpolla Card */}
          <div className="col-md-4">
            <div className="quick-card superpolla-card" onClick={() => navigate('/superpolla')}>
              <div className="card-icon">🏆</div>
              <h3>Superpolla</h3>
              <p>Make your predictions. Climb the global leaderboard.</p>
              <div className="current-rank">
                <span className="rank-label">CURRENT RANK</span>
                <span className="rank-number">#4,209</span>
              </div>
            </div>
          </div>

          {/* Digital Album Card */}
          <div className="col-md-4">
            <div className="quick-card album-card" onClick={() => navigate('/album')}>
              <div className="card-icon">📸</div>
              <h3>Digital Album</h3>
              <p>Collect, trade, and complete your digital sticker album.</p>
              <div className="album-progress">
                <div className="progress">
                  <div className="progress-bar" style={{ width: '28%' }}></div>
                </div>
                <span className="progress-text">28%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Matches Section */}
      <div className="upcoming-matches-section">
        <div className="section-header">
          <h2>Upcoming Matches</h2>
          <span className="subtitle">Group stage fixtures</span>
          <a href="#" className="view-all">
            View all →
          </a>
        </div>

        <div className="matches-container">
          {upcomingMatches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-group">{match.group}</div>
              <div className="match-header">
                <span className="match-date">{match.date}</span>
                <span className="match-time">{match.time}</span>
              </div>

              <div className="match-teams">
                <div className="team">
                  <div className="team-flag">{match.team1.flag}</div>
                  <div className="team-info">
                    <span className="team-code">{match.team1.code}</span>
                    <span className="team-name">{match.team1.name}</span>
                  </div>
                </div>

                <div className="vs-divider">VS</div>

                <div className="team">
                  <div className="team-flag">{match.team2.flag}</div>
                  <div className="team-info">
                    <span className="team-code">{match.team2.code}</span>
                    <span className="team-name">{match.team2.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
