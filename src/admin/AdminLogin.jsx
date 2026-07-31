import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const { login } = useProducts()
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    if (login(password)) {
      navigate('/admin')
    } else {
      setError(true)
    }
  }

  return (
    <div className="admin-login">
      <img src="/images/logo.png" alt="Boralba Lighting" />
      <h1 style={{ fontSize: '1.4rem' }}>Panel de administración</h1>
      <p className="muted">Introduce la contraseña para gestionar los productos.</p>
      <form className="form" onSubmit={submit}>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            placeholder="••••••••"
          />
        </div>
        {error && <div className="error">Contraseña incorrecta.</div>}
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>
      <p className="muted mt-2" style={{ fontSize: '0.82rem' }}>
        Demo: la contraseña por defecto es <code>boralba2024</code>
      </p>
      <p className="mt-2">
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Volver a la web
        </Link>
      </p>
    </div>
  )
}
