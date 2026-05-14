import api_admin from '../../api/api_admin'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/admin_style.css'

function Login() {
    const navigate = useNavigate()
    const [email] = useState('admin@example.com')
    const [password] = useState('admin123') 
    const [error, setError] = useState('')

    const handleLogin = async () => {
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
        <div className="login-wrapper">
            <div className="login-card">
                <h2>Administration</h2>
                <p>Système d'importation - Accès sécurisé</p>

                {error && <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>}

                <div className="login-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="text" 
                            value={email} 
                            readOnly
                            style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            value="••••••••"
                            readOnly 
                            style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}
                        />
                    </div>

                    <button className="btn-login" onClick={handleLogin}>
                        SE CONNECTER EN TANT QU'ADMIN
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
