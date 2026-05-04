import { useAuth } from '../context/AuthContext';

export const Superpolla = () => {
  const { user } = useAuth();

  const pollas = [
    { id: 1, name: 'Polla Principal', participants: 1250, prize: '$50,000' },
    { id: 2, name: 'Polla Fase de Grupos', participants: 890, prize: '$20,000' },
    { id: 3, name: 'Polla Eliminatorias', participants: 650, prize: '$30,000' },
  ];

  return (
    <div className="container mt-4">
      <h1>🏆 Superpollas</h1>
      <p className="text-muted">Bienvenido, {user?.nombre}</p>

      <div className="alert alert-info">
        Participa en nuestras superpollas y gana premios increíbles prediciendo los resultados de los partidos.
      </div>

      <div className="row mt-4">
        {pollas.map((polla) => (
          <div key={polla.id} className="col-md-4 mb-4">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{polla.name}</h5>
              </div>
              <div className="card-body">
                <p className="card-text">
                  <strong>Participantes:</strong> {polla.participants.toLocaleString()}<br />
                  <strong>Premio:</strong> {polla.prize}
                </p>
                <button className="btn btn-primary btn-sm">Participar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
