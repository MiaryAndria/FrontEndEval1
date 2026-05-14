import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'

function DetailProduit() {
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [message, setMessage] = useState('')
    const [panier, setPanier] = useState({
        product_id: '',
        is_buy_now:'',
        quantity: ''

    })
    const { id } = useParams()
    const navigate = useNavigate()

    const fetchDetailProduit = async () => {
        try {
            const response = await api_client.get(`/products/${id}`)
            const data = response.data.data
            setProduct(data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des détails')
            setLoading(false)
        }
    }

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
        if (id) {
            fetchDetailProduit()
        }
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

                    {(product.qty === 0 || !product.in_stock) && (
                        <p className="stock-badge">Rupture de stock</p>
                    )}
                    
                    {/* Sélecteur de Quantité */}
                    <div className="qty-section">
                        <span className="qty-label">Quantité</span>
                        <div className="quantity-selector">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>

                    <button
                        onClick={ajouterPanier}
                        className={`btn btn-full ${product.in_stock ? 'btn-primary' : 'btn-outline'}`}
                        disabled={!product.in_stock}
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
