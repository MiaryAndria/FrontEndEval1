import api_client from '../../api/api_client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await api_client.post('/customer/login', {
                email,
                password,
                device_name: 'newapp'
            })
            localStorage.setItem('token_client', response.data.token)
            navigate('/client/categorie/list')
        } catch (err) {
            setError('Identifiants incorrects ou erreur serveur')
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Espace Client</h1>
                    <p>Connectez-vous pour accéder à la boutique</p>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Adresse Email</label>
                        <input 
                            type="email" 
                            className="input-field"
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="vous@exemple.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            className="input-field"
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <LogIn size={18} />
                        SE CONNECTER
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login