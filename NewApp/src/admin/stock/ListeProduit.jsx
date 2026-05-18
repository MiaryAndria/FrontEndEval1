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

            <div className="card cart-table-container">
                <table className="cart-items">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nom du Produit</th>
                            <th>SKU</th>
                            <th>Prix</th>
                            <th className="text-center">Stock</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produit.map(product => (
                            <tr key={product.id}>
                                <td className="img-cell">
                                    {product.images?.[0]?.url ? (
                                        <img src={product.images[0].url} alt={product.name} className="product-img" />
                                    ) : (
                                        <div className="no-image-placeholder">
                                            Aucune
                                        </div>
                                    )}
                                </td>
                                <td className="product-name-cell">{product.name}</td>
                                <td className="sku-cell">{product.sku}</td>
                                <td>{product.price} €</td>
                                <td className={`text-center stock-cell ${(product.inventories?.[0]?.qty || 0) > 0 ? 'stock-ok' : 'stock-empty'}`}>
                                    {product.inventories?.[0]?.qty || 0}
                                </td>
                                <td className="text-center">
                                    <div className="action-buttons">
                                        <Link to={`/admin/stock/add/${product.id}`} className="btn btn-primary btn-sm">
                                            Stock
                                        </Link>
                                        <Link to={`/admin/stock/info/${product.id}`} className="btn btn-outline btn-sm">
                                            Bilan
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {produit.length === 0 && !loading && (
                <p className="text-center mt-20">Aucun produit trouvé.</p>
            )}
        </div>
    )
}

export default ListProduit