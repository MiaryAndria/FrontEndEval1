import api_client from '../../api/api_client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginAdmin (){
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

const handleLogin = async () => {
    try {
        const response = await api_client.post('/customer/login', {
            email,
            password,
            device_name: 'newapp'
        })
        console.log(response.data)
        localStorage.setItem('token_client', response.data.token)
        navigate('/client/categorie/list')
    } catch (error) {
        console.log(error.response.data)
    }
}
    return <div>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)} />Entrer nom user<p/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />Entrer mdp <p/>
        <button onClick={handleLogin}>Se connecter</button>
    </div>

}

export default LoginAdmin