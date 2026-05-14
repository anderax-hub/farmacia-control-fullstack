import './Panel.css'

function Panel() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  return (
    <main className="panel">
      <section className="hero-panel">
        <div>
          <h1>Panel Principal</h1>
          <p>
            Bienvenido {usuario?.nombre || 'Administrador'} - Rol: {usuario?.rol || 'Administrador'}
          </p>
        </div>
      </section>

      <section className="resumen-grid">
        <div className="resumen-card">
          <span>👥</span>
          <h3>Usuarios</h3>
          <p>3</p>
        </div>

        <div className="resumen-card principal">
          <span>📦</span>
          <h3>Inventario</h3>
          <p>2 productos</p>
        </div>

        <div className="resumen-card principal">
          <span>🧾</span>
          <h3>Ventas</h3>
          <p>Activas</p>
        </div>

        <div className="resumen-card">
          <span>⚠️</span>
          <h3>Próximos a vencer</h3>
          <p>1</p>
        </div>

        <div className="resumen-card">
          <span>📊</span>
          <h3>Ganancia potencial</h3>
          <p>Q 231</p>
        </div>
      </section>

    </main>
  )
}

export default Panel
