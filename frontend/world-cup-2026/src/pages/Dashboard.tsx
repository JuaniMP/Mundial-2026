import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h2>⚽ Welcome to Mundial 2026 Hub</h2>
        </div>
        <div className="card-body">
          <h4>User Information</h4>
          <table className="table table-striped">
            <tbody>
              <tr>
                <td><strong>Name:</strong></td>
                <td>{user?.nombre}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{user?.email}</td>
              </tr>
              <tr>
                <td><strong>Role:</strong></td>
                <td>
                  <span className="badge bg-info">{user?.rol}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <p className="text-muted">
              Welcome to the Mundial 2026 World Cup Hub! This is your personalized dashboard.
            </p>
          </div>

          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
