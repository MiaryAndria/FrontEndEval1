import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'

function List() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const fetchCategories = async () => {
        try {
            const response = await api_client.get('/categories?sort=id&limit=100')
            setCategories(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des catégories')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCategoryClick = (id) => {
        navigate(`/client/categorie/${id}/produit`)
    }

    if (loading) return <div className="client-container">Chargement...</div>

    return (
        <div className="client-container">
            <button className="btn btn-primary mt-20" onClick={() => navigate('/WishList')}>Acceder Wishlist</button>
            <button className="btn btn-primary mt-20" onClick={() => navigate('/Commande')}>Acceder mes commandes</button>
            <button className="btn btn-primary mt-20" onClick={() => navigate('/Panier')}>Acceder panier</button>
            <h1>Nos Catégories</h1>

            {message && <p className="stock-badge">{message}</p>}

            <div className="category-grid">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="card"
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        {category.logo_url ? (
                            <img src={category.logo_url} alt={category.name} />
                        ) : (
                            <div className="text-center" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', color: '#ccc' }}>
                                Pas d'image
                            </div>
                        )}
                        <h2 className="card-title">{category.name}</h2>
                        <div className="detail-sku" dangerouslySetInnerHTML={{ __html: category.description }} />
                        <button className="btn btn-outline btn-full mt-20">
                            Découvrir
                        </button>
                    </div>
                ))}
            </div>

            {categories.length === 0 && !loading && (
                <p className="text-center mt-20">Aucune catégorie trouvée.</p>
            )}
        </div>
    )
}

export default List
