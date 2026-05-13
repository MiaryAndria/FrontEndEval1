import axios from 'axios'

const api_node = axios.create({
    baseURL: 'http://localhost:3001',        
    headers: {
        'Accept': 'application/json',      
        'Content-Type': 'application/json' 
    }
})

api_node.interceptors.request.use(config => {
    const token = localStorage.getItem('token_admin')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api_node