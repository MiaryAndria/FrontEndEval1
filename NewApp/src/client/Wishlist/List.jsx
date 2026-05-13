import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'

function Wishlist() {
const [wishlist, setWishlist] = useState([])
const [loading, setLoading] = useState(true)
const [message, setMessage] = useState('')
const navigate = useNavigate()

const fetchWishlist = async () => {
    try {
        const response = await api_client.get('/customer/wishlist')
        setWishlist(response.data.data)
        setLoading(false)
    } catch (error) {
        setMessage('Erreur lors du chargement de la liste de souhaits')
        setLoading(false)
    }
}

useEffect(() => {
    fetchWishlist()
}, [])

if (loading) return <div className="client-container">Chargement...</div>

return (
    <div className="client-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>Ma Liste de Souhaits</h1>
            <button className="btn btn-primary" onClick={() => navigate('/Panier')}>
                Accéder au panier
            </button>
        </div>

        {message && (
            <div className="stock-badge" style={{ backgroundColor: '#e9f7f6', color: '#2a9d8f', padding: '10px', borderRadius: '4px', marginBottom: '20px', width: '100%' }}>
                {message}
            </div>
        )}

        <div className="product-grid">
            {wishlist.map(item => {
                const product = item.product;
                if (!product) return null;

                return (
                    <div key={item.id} className="card">
                        <div onClick={() => navigate(`/client/produit/${product.id}`)}>
                            {product.base_image?.small_image_url ? (
                                <img src={product.base_image.small_image_url} alt={product.name} />
                            ) : (
                                <div className="text-center" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', color: '#ccc', marginBottom: '20px' }}>
                                    Aucune image
                                </div>
                            )}
                        </div>

                        <div onClick={() => navigate(`/client/produit/${product.id}`)}>
                            <h3 className="card-title">{product.name}</h3>
                            <p className="card-price">{product.formatted_price || product.price}</p>
                        </div>

                        <div className="mt-20" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        </div>
                    </div>
                )
            })}
        </div>

        {wishlist.length === 0 && !loading && (
            <div className="text-center mt-20">
                <p>Votre liste de souhaits est vide.</p>
                <button className="btn btn-outline" onClick={() => navigate('/client/categorie/list')}>
                    Continuer mes achats
                </button>
            </div>
        )}
    </div>
)
}

export default Wishlist
