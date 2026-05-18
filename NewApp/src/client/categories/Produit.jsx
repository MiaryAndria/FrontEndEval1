import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api_client from '../../api/api_client'
// import Stock from '../../services/SimulationCommande'
import '../css/client_style.css'

function ProduitCategorie() {
    const [produits, setProduits] = useState([])
    const [loading, setLoading] = useState(true)
    const [quantities, setQuantities] = useState({})
    const [message, setMessage] = useState('')
    const navigate = useNavigate()
    const { id } = useParams()

    // const [stocks, setStocks] = useState({})

    const fetchProduits = async () => {
        try {
            const response = await api_client.get(`/products?category_id=${id}&sort=id&limit=100`)
            const prods = response.data.data
            setProduits(prods)
            setLoading(false)
            
            // fetchStocksSimules(prods)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
    }

    // const fetchStocksSimules = async (prods) => {
    //     const newStocks = {}
    //     for (const p of prods) {
    //         if (p.type !== "configurable") {
    //             try {
    //                 newStocks[p.id] = await Stock.getSingleProductStock(p.id)
    //             } catch (e) {
    //                 console.error("Erreur stock simulation", e)
    //             }
    //         }
    //     }
    //     setStocks(newStocks)
    // }

    const ajouterPanier = async (produitId) => {
        try {
            await api_client.post(`/customer/cart/add/${produitId}`, {
                product_id: produitId,
                quantity:quantities[produitId]||1,
                is_buy_now:0
                
            })
            window.dispatchEvent(new CustomEvent('cart-updated'))
            fetchProduits()

        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Erreurs de validation:', error.response.data)
                alert('Erreur: ' + JSON.stringify(error.response.data.errors || error.response.data.message))
            } else {
                console.error('Erreur lors ajout panier', error)
            }
        }
    }

    const handleQuantityChange = (produitId, delta) => {
        const produit = produits.find(p => p.id === produitId);
        const maxStock = produit?.inventory_indices?.[0]?.qty !== undefined ? produit.inventory_indices[0].qty : 9999;
        
        setQuantities(prev => {
            const currentQty = prev[produitId] || 1;
            let newQty = currentQty + delta;
            
            if (delta > 0 && newQty > maxStock) {
                setMessage(`Désolé, seulement ${maxStock} exemplaires disponibles.`);
                setTimeout(() => setMessage(''), 3000);
                return prev;
            }
            
            return {
                ...prev,
                [produitId]: Math.max(1, newQty)
            };
        });
    }
    
    const addToWishlist = async (produitId) => {
        try {
            
            await api_client.post(`/customer/wishlist/${produitId}`, {                
            })
            window.dispatchEvent(new CustomEvent('wishlist-updated'))
            fetchProduits()

        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Erreurs de validation:', error.response.data)
                alert('Erreur: ' + JSON.stringify(error.response.data.errors || error.response.data.message))
            } else {
                console.error('Erreur lors ajout wishlist', error)
            }
        }
    }

    useEffect(() => {
        if (id) {
            fetchProduits()
        }
    }, [id])

    if (loading) return <div className="client-container">Chargement des produits...</div>

    return (
        
        <div className="client-container">
            <h1>Collection {id}</h1>

            {message && <p className="stock-badge">{message}</p>}

            <div className="product-grid">
                   
                {produits.map(produit => {
                    if (produit.type === "configurable") {
                    return null
                    }       
                    const currentQty = quantities[produit.id] || 1 
                    return (
                        <div key={produit.id} className="card">
                            {/* Image */}
                            <div onClick={() => navigate(`/client/produit/${produit.id}`)}>
                                {produit.base_image?.small_image_url ? (
                                    <img src={produit.base_image.small_image_url} alt={produit.name} />
                                ) : (
                                    <div className="text-center" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', color: '#ccc', marginBottom: '20px' }}>
                                        No image
                                    </div>
                                )}
                            </div>

                            {/* Infos */}
                            <div onClick={() => navigate(`/client/produit/${produit.id}`)}>
                                <h3 className="card-title">{produit.name}</h3>
                                <p className="card-price">{produit.formatted_price}</p>
                            </div>

                            {produit.inventory_indices?.[0]?.qty === undefined ? (
                                <p className="stock-badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                                    Vérification du stock...
                                </p>
                            ) : produit.inventory_indices?.[0]?.qty === 0 ? (
                                <p className="stock-badge">Rupture de stock</p>
                            ) : null}

                            <div className="mt-20" style={{ marginTop: 'auto' }}>
                                {/* Sélecteur de Quantité */}
                                <div className="quantity-selector">
                                    <button onClick={() => handleQuantityChange(produit.id, -1)} disabled={currentQty <= 1}>-</button>
                                    <span>{currentQty}</span>
                                    <button onClick={() => handleQuantityChange(produit.id, 1)} disabled={produit.inventory_indices?.[0]?.qty === undefined || currentQty >= produit.inventory_indices[0].qty}>+</button>
                                </div>

                                {/* Boutons Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button
                                        onClick={() => ajouterPanier(produit.id)}
                                        className={`btn btn-full ${produit.inventory_indices?.[0]?.qty > 0 ? 'btn-primary' : 'btn-outline'}`}
                                        disabled={produit.inventory_indices?.[0]?.qty === undefined || produit.inventory_indices?.[0]?.qty === 0}
                                        style={{ padding: '8px', fontSize: '0.85rem' }}
                                    >   Ajouter panier
                                    </button>
                                    <button
                                        onClick={() => addToWishlist(produit.id)}
                                        className={`btn btn-full ${produit.inventory_indices?.[0]?.qty > 0 ? 'btn-primary' : 'btn-outline'}`}
                                        disabled={produit.inventory_indices?.[0]?.qty === undefined || produit.inventory_indices?.[0]?.qty === 0}
                                        style={{ padding: '8px', fontSize: '0.85rem' }}
                                    >   Ajouter Wishlist
                                    </button>
                                    <button 
                                        className="btn btn-outline btn-full" 
                                        onClick={() => navigate(`/client/produit/${produit.id}`)}
                                        style={{ padding: '8px', fontSize: '0.85rem' }}
                                    >
                                        Détails
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {produits.length === 0 && !loading && (
                <p className="text-center mt-20">Aucun produit trouvé dans cette catégorie.</p>
            )}

        </div>
    )
}

export default ProduitCategorie
