import { useAuth } from '../context/AuthContext';

export const Album = () => {
  const { user } = useAuth();

  const albums = [
    { id: 1, name: 'Álbum Digital 2026', cards: 450, collected: 127 },
    { id: 2, name: 'Leyendas del Fútbol', cards: 200, collected: 45 },
    { id: 3, name: 'Equipos Nacionales', cards: 300, collected: 89 },
  ];

  return (
    <div className="container mt-4">
      <h1>📸 Álbum Digital</h1>
      <p className="text-muted">Bienvenido, {user?.nombre}</p>

      <div className="row mt-4">
        {albums.map((album) => (
          <div key={album.id} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{album.name}</h5>
                <p className="card-text">
                  <strong>Cromos Totales:</strong> {album.cards}<br />
                  <strong>Cromos Recolectados:</strong> {album.collected}/{album.cards}
                </p>
                <div className="progress" style={{ height: '20px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${(album.collected / album.cards) * 100}%` }}
                  >
                    {Math.round((album.collected / album.cards) * 100)}%
                  </div>
                </div>
                <button className="btn btn-primary btn-sm mt-3">Ver Álbum</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
