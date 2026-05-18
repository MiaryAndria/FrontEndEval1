import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'
// import Stock from '../../services/SimulationCommande'

function DetailProduit() {
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    // const [realStock, setRealStock] = useState(null)
    const { id } = useParams()
    const navigate = useNavigate()

    const fetchDetailProduit = async () => {
        try {
            const response = await api_client.get(`/products/${id}`)
            setProduct(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des détails')
            setLoading(false)
        }
    }


    // const fetchStock = async () => {
    //     try {
    //         const stock = await Stock.getSingleProductStock(id)
    //         setRealStock(stock)
    //     } catch (error) {
    //         console.error('Erreur récupération stock', error)
    //     }
    // }
    
    const ajouterPanier = async () => {
        try {
            await api_client.post(`/customer/cart/add/${id}`, {
                product_id: product.id,
                quantity:quantity,
                is_buy_now:0
                
            })
            window.dispatchEvent(new CustomEvent('cart-updated'))
            fetchDetailProduit()

        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Erreurs de validation:', error.response.data)
                alert('Erreur: ' + JSON.stringify(error.response.data.errors || error.response.data.message))
            } else {
                console.error('Erreur lors ajout panier', error)
            }
        }
    }

    useEffect(() => {
        fetchDetailProduit()
        // fetchStock()
    }, [id])

    if (loading) return <div className="client-container">Chargement...</div>

    if (!product) return (
        <div className="client-container text-center">
            <h2>Produit non trouvé</h2>
            <button className="btn btn-primary mt-20" onClick={() => navigate(-1)}>Retour</button>
        </div>
    )

    return (
        <div className="client-container">

            <div className="detail-layout">
                {/* Section Image */}
                <div className="detail-image-container">
                    <img 
                        src={product.base_image?.large_image_url || product.images?.url} 
                        alt={product.name} 
                    />
                </div>

                {/* Section Infos */}
                <div className="detail-info">
                    <h1>{product.name}</h1>
                    <p className="detail-sku">SKU: {product.sku}</p>
                    
                    <p className="price-large">
                        {product.formatted_price}
                    </p>

                    <div className="detail-description">
                        <h3>À propos de ce produit</h3>
                        <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                    </div>

                    {product.inventory_indices?.[0]?.qty === null ? (
                        <p className="stock-badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                            Vérification du stock...
                        </p>
                    ) : product.inventory_indices?.[0]?.qty === 0 ? (
                        <p className="stock-badge">Rupture de stock</p>
                    ) : null}
                    
                    {/* Sélecteur de Quantité */}
                    <div className="qty-section">
                        <span className="qty-label">Quantité</span>
                        <div className="quantity-selector">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >-</button>
                            <span>{quantity}</span>
                            <button 
                                onClick={() => setQuantity(Math.min(product.inventory_indices?.[0]?.qty || 0, quantity + 1))}
                                disabled={product.inventory_indices?.[0]?.qty === null || quantity >= product.inventory_indices?.[0]?.qty}
                            >+</button>
                        </div>
                    </div>

                    <div>
                        <h1>Quantité en stock</h1>
                        <p>{product.inventory_indices?.[0]?.qty === null ? 'Calcul...' : product.inventory_indices?.[0]?.qty}</p>
                    </div>

                    <button
                        onClick={ajouterPanier}
                        className={`btn btn-full ${product.inventory_indices?.[0]?.qty > 0 ? 'btn-primary' : 'btn-outline'}`}
                        disabled={product.inventory_indices?.[0]?.qty === null || product.inventory_indices?.[0]?.qty === 0}
                    >Ajouter panier
                    </button>
                </div>
            </div>

            {/* Description Complète */}
            <div className="specs-section">
                <h2>Spécifications techniques</h2>
                <div 
                    className="detail-description" 
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                />
            </div>
        </div>
         
    )
}

export default DetailProduit
