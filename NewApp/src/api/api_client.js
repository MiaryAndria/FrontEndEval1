import axios from 'axios'

const api_client = axios.create({
    baseURL: 'http://localhost:8000/api/v1',        
    headers: {
        'Accept': 'application/json',      
        'Content-Type': 'application/json' 
    }
})

api_client.interceptors.request.use(config => {
    const token = localStorage.getItem('token_client')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api_client