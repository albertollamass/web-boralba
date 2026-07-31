import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login">
      <img src="images/logo.png" alt="Boralba Lighting" />
      <h1 style={{ fontSize: '1.4rem' }}>Panel de administración</h1>
      <p className="muted">Inicia sesión con tu cuenta de Boralba Lighting para gestionar los productos.</p>
      {!isSupabaseConfigured ? (
        <div className="error" style={{ margin: '16px 0' }}>
          Supabase no está configurado. Crea el archivo <code>.env</code> con tus claves de{' '}
          <code>boralba-lightning</code> y reinicia el servidor.
        </div>
      ) : (
        <form className="form" onSubmit={submit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@boralba.com"
              required
            />
          </div>
          <div>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      )}
      <p className="mt-2">
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Volver a la web
        </Link>
      </p>
    </div>
  )
}
