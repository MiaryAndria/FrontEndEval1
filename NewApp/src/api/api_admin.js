import axios from 'axios'

const api_admin = axios.create({
    baseURL: 'http://localhost:8000/api/v1',        
    // baseURL: 'http://localhost:8000',      
    headers: {
        'Accept': 'application/json',      
        'Content-Type': 'application/json' 
    }
})

api_admin.interceptors.request.use(config => {
    const token = localStorage.getItem('token_admin')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api_admin