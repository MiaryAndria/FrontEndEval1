import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'

function ValiderCommande() {
    const navigate = useNavigate()
    const [panier, setPanier] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [user, setUser] = useState(null)

    const [adresse, setAdresse] = useState({
        adress: '',
        city: '',
        state: '',
        country: 'US',
        first_name: '',
        last_name: '',
        email: '',
        postcode: '',
        phone: ''
    })

    const [shipping, setShipping] = useState({
        shipping_method: 'free_free'
    })

    const [payement, setPayement] = useState({
        method: 'cashondelivery'
    })

    const fetchPanier = async () => {
        try {
            const response = await api_client.get('/customer/cart')
            setPanier(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token_client')
        if (token) {
            api_client.get('customer/get').then(response => {
                const userData = response.data.data
                setUser(userData)
                setAdresse(prev => ({
                    ...prev,
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || ''
                }))
            }).catch(err => console.error("Account fetch error:", err))
        }
        fetchPanier()
    }, [])

    const SaveAdress = async () => {
        await api_client.post('/customer/checkout/save-address', {
            billing: {
                ...adresse,
                address: [adresse.adress],
                save_as_address: false,
                use_for_shipping: true
            },
            shipping: {
                ...adresse,
                address: [adresse.adress],
                save_as_address: false
            }
        })
    }

    const SaveShipping = async () => {
        await api_client.post('/customer/checkout/save-shipping', {
            shipping_method: shipping.shipping_method
        })
    }

    const SavePayement = async () => {
        await api_client.post('/customer/checkout/save-payment', {
            payment: {
                method: payement.method
            }
        })
    }

    const SaveOrde = async () => {
        try {
            setLoading(true)
            await SaveAdress()
            await SaveShipping()
            await SavePayement()

            const response = await api_client.post('/customer/checkout/save-order')
            
            if (response.data.data) {
                setMessage('Commande enregistrée avec succès !')
                setTimeout(() => navigate('/commande'), 3000)
            }
        } catch (error) {
            console.error(error)
            setMessage('Erreur lors insertion')
            setLoading(false)
        }
    }

    const handleChangeAdresse = (e) => {
        const { name, value } = e.target
        setAdresse(prev => ({ ...prev, [name]: value }))
    }

    // const handleChangeShipping = (e) => {
    //     const { name, value } = e.target
    //     setShipping(prev => ({ ...prev, [name]: value }))
    // }

    // const handleChangePayement = (e) => {
    //     const { name, value } = e.target
    //     setPayement(prev => ({ ...prev, [name]: value }))
    // }

    if (loading) return <div className="client-container">Chargement...</div>
    if (!panier) return <div className="client-container">Panier vide</div>

    const items = Array.isArray(panier.items) ? panier.items : [panier.items]

    return (
        <div className="client-container">
            <h1>Validation de la commande</h1>

            {message && (
                <p className="stock-badge" style={{ color: message.includes('Erreur') ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    {message}
                </p>
            )}

            <div className="detail-layout">
                {/* COLONNE GAUCHE : ADRESSE ET ARTICLES */}
                <div className="cart-items">
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h2>Informations de livraison</h2>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                            <div className="form-group">
                                <label>Prénom</label>
                                <input type="text" name="first_name" value={adresse.first_name} onChange={handleChangeAdresse} />
                            </div>
                            <div className="form-group">
                                <label>Nom</label>
                                <input type="text" name="last_name" value={adresse.last_name} onChange={handleChangeAdresse} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Email</label>
                                <input type="email" name="email" value={adresse.email} onChange={handleChangeAdresse} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Adresse</label>
                                <input type="text" name="adress" value={adresse.adress} onChange={handleChangeAdresse} placeholder="Ex: 70 Winchester Rd" />
                            </div>
                            <div className="form-group">
                                <label>Ville</label>
                                <input type="text" name="city" value={adresse.city} onChange={handleChangeAdresse} placeholder="Ex: Paris" />
                            </div>
                            <div className="form-group">
                                <label>État</label>
                                <input type="text" name="state" value={adresse.state} onChange={handleChangeAdresse} placeholder="Ex: IDF" />
                            </div>
                            <div className="form-group">
                                <label>Pays</label>
                                <input type="text" name="country" value={adresse.country} onChange={handleChangeAdresse} placeholder="Ex: FR" />
                            </div>
                            <div className="form-group">
                                <label>Code Postal</label>
                                <input type="text" name="postcode" value={adresse.postcode} onChange={handleChangeAdresse} placeholder="Ex: 75000" />
                            </div>
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input type="text" name="phone" value={adresse.phone} onChange={handleChangeAdresse} placeholder="Ex: 0123456789" />
                            </div>
                        </div>
                    </div>

                    <h3>Articles dans votre panier</h3>
                    {items.map(item => (
                        <div key={item.id} className="card cart-item-card">
                            <div className="cart-item-info">
                                <h2 className="card-title">{item.name}</h2>
                                <p className="detail-sku">SKU: {item.sku}</p>
                                <p>{item.quantity} x {item.formatted_price}</p>
                            </div>
                            <div className="cart-item-actions">
                                <p className="cart-item-price">{item.formatted_total}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* COLONNE DROITE : RESUME ET ACTIONS */}
                <div className="cart-summary">
                    <div className="card">
                        <h2 className="summary-divider">Résumé</h2>
                        <div className="summary-row">
                            <span>Articles</span>
                            <span>{panier.items_count}</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>{panier.formatted_grand_total}</span>
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                            <label>Méthode de livraison</label>
                            <input 
                                type="text" 
                                name="shipping_method" 
                                value={shipping.shipping_method} 
                                // onChange={handleChangeShipping}
                                style={{ width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px' }}
                            />

                            <label>Méthode de paiement</label>
                            <input 
                                type="text" 
                                name="method" 
                                value={payement.method} 
                                // onChange={handleChangePayement}
                                style={{ width: '100%', padding: '10px', marginTop: '5px', marginBottom: '20px' }}
                            />

                            <button className="btn btn-primary btn-full" onClick={SaveOrde}>
                                Commander
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ValiderCommande



