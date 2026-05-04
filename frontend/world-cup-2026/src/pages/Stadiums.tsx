import { useAuth } from '../context/AuthContext';

export const Stadiums = () => {
  const { user } = useAuth();

  const stadiums = [
    { id: 1, name: 'Estadio Azteca', city: 'México', capacity: 87523 },
    { id: 2, name: 'SoFi Stadium', city: 'Los Ángeles, USA', capacity: 70240 },
    { id: 3, name: 'MetLife Stadium', city: 'Nueva Jersey, USA', capacity: 82500 },
    { id: 4, name: 'AT&T Stadium', city: 'Dallas, USA', capacity: 80000 },
    { id: 5, name: 'Arrowhead Stadium', city: 'Kansas City, USA', capacity: 76416 },
    { id: 6, name: 'Estadio BBVA', city: 'Monterrey, México', capacity: 53000 },
  ];

  return (
    <div className="container mt-4">
      <h1>⚽ Estadios 2026</h1>
      <p className="text-muted">Bienvenido, {user?.nombre}</p>

      <div className="row mt-4">
        {stadiums.map((stadium) => (
          <div key={stadium.id} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{stadium.name}</h5>
                <p className="card-text">
                  <strong>Ciudad:</strong> {stadium.city}<br />
                  <strong>Capacidad:</strong> {stadium.capacity.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
