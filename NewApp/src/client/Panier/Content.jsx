import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' 
import api_client from '../../api/api_client'
import '../css/client_style.css'

function Panier() {
const navigate = useNavigate()
const [panier, setPanier] = useState(null)
const [loading, setLoading] = useState(true)
const [quantities, setQuantities] = useState({})
const [message, setMessage] = useState('')

const fetchPanier = async () => {
    try {
        const response = await api_client.get('/customer/cart')
        const cartData = response.data.data
        setPanier(cartData)
        
        setLoading(false)
    } catch (error) {
        setMessage('Erreur lors du chargement du panier')
        setLoading(false)
    }
}

const updateCartItem = async (itemId, quantity) => {
    try {
        const response = await api_client.put('customer/cart/update', {
            qty: {
                [itemId]: quantity
            }
        })
        if (response.data.data) {
            setPanier(response.data.data)
            setMessage('Panier mis à jour')
            setTimeout(() => setMessage(''), 3000)
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du panier', error)
        setMessage('Erreur lors de la mise à jour')
    }
}

const deleteProduct = async (itemId) => {
    try {
        await api_client.delete(`/customer/cart/remove/${itemId}`)
        console.log("Produit supprimé du panier")
        
        fetchPanier()

    } catch (error) {
        console.error("Erreur suppression produit :", error)
    }
}

const handleQuantityChange = (itemId, delta) => {
    const currentQty = quantities[itemId] || 1
    const newQty = Math.max(1, currentQty + delta)
    
    setQuantities(prev => ({
        ...prev,
        [itemId]: newQty
    }))

    updateCartItem(itemId, newQty)
}

useEffect(() => {
    fetchPanier()
}, [])

if (loading) return <div className="client-container">Chargement...</div>

if (!panier || !panier.items || (Array.isArray(panier.items) && panier.items.length === 0)) {
    return (
        <div className="client-container">
            <h1>Mon Panier</h1>
            <div className="card text-center">
                <p>Votre panier est vide</p>
            </div>
        </div>
    )
}

const items = Array.isArray(panier.items) ? panier.items : [panier.items]

return (
    <div className="client-container">
        <h1>Mon Panier</h1>

        {message && (
            <p className="stock-badge" style={{ color: message.includes('Erreur') ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {message}
            </p>
        )}

        <div className="detail-layout">
            {/* ITEMS DU PANIER */}
            <div className="cart-items">
                {items.map(item => (
                    <div key={item.id} className="card cart-item-card">
                        <div className="cart-item-info">
                            <h2 className="card-title">{item.name}</h2>
                            <p className="detail-sku">SKU: {item.sku}</p>
                            
                            {item.additional?.attributes && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {Object.values(item.additional.attributes).map((attr, idx) => (
                                        <span key={idx}>{attr.attribute_name}: {attr.option_label} </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="cart-item-actions">
                            <p className="cart-item-price">{item.formatted_total}</p>
                            
                            <div className="quantity-selector">
                                <button onClick={()=>deleteProduct(item.id)}>Enlever</button>
                                <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                <span>{quantities[item.id] || item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* RESUME PANIER */}
            <div className="cart-summary">
                <div className="card">
                    <h2 className="summary-divider">Résumé</h2>
                    <div className="summary-row">
                        <span>Articles</span>
                        <span>{panier.items_count}</span>
                    </div>
                    <div className="summary-row">
                        <span>Quantité totale</span>
                        <span>{panier.items_qty}</span>
                    </div>
                    <div className="summary-total">
                        <span>Total</span>
                        <span>{panier.formatted_grand_total}</span>
                    </div>
                    <button 
                        className="btn btn-outline btn-full" 
                        onClick={() => navigate(`/checkout`)}
                    >
                    Valider commande
                    </button>
                </div>
            </div>
        </div>
    </div>
)
}

export default Panier

