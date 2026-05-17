import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'

function ListProduit() {
    const [produit, setProduct] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    const fetchProduits = async () => {
        try {
            const response = await api_admin.get('/admin/catalog/products?limit=1000')
            setProduct(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des produits')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProduits()
    }, [])

    if (loading) return <div className="client-container">Chargement...</div>

    return (
        <div className="client-container">
            <h1>Liste des Produits</h1>

            {message && <p className="stock-badge">{message}</p>}

            <div className="category-grid">
                {produit.map(product => (
                    <div key={product.id} className="card">
                        {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} />
                        ) : (
                            <div className="text-center" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', color: '#ccc' }}>
                                Pas d'image
                            </div>
                        )}
                        <h2 className="card-title">{product.name}</h2>
                        <p className="detail-sku">SKU : {product.sku}</p>
                        <p className="detail-sku">Prix : {product.price} €</p>

                        <div className="product-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <Link
                                to={`/admin/stock/add/${product.id}`}
                                className="btn btn-primary"
                                style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '10px' }}
                            >
                                 <span style={{color: 'white'}}>Modifier stock</span>
                            </Link>

                            <Link
                                to={`/admin/stock/info/${product.id}`}
                                className="btn btn-outline"
                                style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '10px' }}
                            >
                                 <span style={{color: 'var(--text-color)'}}>Bilan</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {produit.length === 0 && !loading && (
                <p className="text-center mt-20">Aucun produit trouvé.</p>
            )}
        </div>
    )
}

export default ListProduit