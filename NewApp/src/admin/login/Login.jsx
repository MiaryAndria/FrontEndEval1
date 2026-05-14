import api_admin from '../../api/api_admin'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

function LoginAdmin() {
    const navigate = useNavigate()
    const [email] = useState('admin@example.com')
    const [password] = useState('admin123') 
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const response = await api_admin.post('/admin/login', {
                email: email,
                password: password,
                device_name:'newapp'
            })
            
            localStorage.setItem('token_admin', response.data.token)
            navigate('/acceuil/admin')
        } catch (err) {
            setError('Erreur de connexion avec les identifiants prédéfinis')
            console.log(err.response?.data)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Administration</h1>
                    <p>Système de gestion - Accès sécurisé</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Admin</label>
                        <input 
                            type="text" 
                            className="input-field"
                            value={email} 
                            readOnly
                            style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            className="input-field"
                            value="••••••••"
                            readOnly 
                            style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        <ShieldCheck size={18} />
                        ACCÈS ADMINISTRATEUR
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginAdmin
