import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'
// import axios from 'axios'
// import Stock from '../../services/SimulationCommande'

function Panier() {
    const navigate = useNavigate()
    const [panier, setPanier] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantities, setQuantities] = useState({})
    // const [stocks, setStocks] = useState({})
    const [message, setMessage] = useState('')

    const fetchPanier = async () => {
        try {
            const response = await api_client.get('/customer/cart')
            const cartData = response.data.data
            setPanier(cartData)
            // if (cartData?.items) {
            //     await fetchStocksPanier(cartData.items)
            // }
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement du panier')
            setLoading(false)
        }
    }

    // const fetchStocksPanier = async (items) => {
    //     const stocksObj = {}
    //     const itemList = Array.isArray(items) ? items : [items]
    //     for (const item of itemList) {
    //         try {
    //             const productId = item.product_id || item.product?.id;
    //             if (!productId) continue;
    //             const qty = await Stock.getSingleProductStock(productId);
    //             stocksObj[productId] = qty;
    //         } catch (e) {
    //             console.error('Erreur stock via simulation pour produit', item, e)
    //         }
    //     }
    //     setStocks(stocksObj)
    // }

    const updateCartItem = async (itemId, quantity) => {
        try {
            const response = await api_client.put('customer/cart/update', {
                qty: { [itemId]: quantity }
            })
            if (response.data.data) {
                setPanier(response.data.data)
                window.dispatchEvent(new CustomEvent('cart-updated'))
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
            window.dispatchEvent(new CustomEvent('cart-updated'))
            fetchPanier()
        } catch (error) {
            console.error('Erreur suppression produit :', error)
        }
    }

    const handleQuantityChange = (item, delta) => {
        const itemId = item.id
        // const productId = item.product_id || item.product?.id;
        const currentQty = quantities[itemId] || item.quantity
        const maxStock = item.product?.inventory_indices?.[0]?.qty || 0 
        // const maxStock = stocks[productId] || 0

        let newQty = currentQty + delta

        if (delta > 0 && newQty > maxStock) {
            setMessage(`Désolé, seulement ${maxStock} exemplaires disponibles.`)
            setTimeout(() => setMessage(''), 3000)
            return
        }

        newQty = Math.max(1, newQty)

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
                                    <button onClick={() => deleteProduct(item.id)}>Enlever</button>
                                    <button onClick={() => handleQuantityChange(item, -1)}>-</button>
                                    <span>{quantities[item.id] || item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item, 1)}>+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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

