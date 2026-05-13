import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_client from '../../api/api_client'
import '../css/client_style.css'

function ListeCommande() {
    const [commandes, setCommandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const fetchCommandes = async () => {
        try {
            const response = await api_client.get('/customer/orders')
            setCommandes(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des commandes')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCommandes()
    }, [])


    if (loading) return <div className="client-container">Chargement...</div>

    return (
        <div className="client-container">

            <button className="btn btn-primary mt-20" onClick={() => navigate('/client/categorie/list')}>
            Continuer achats 
            </button>

            <h1>Mes Commandes</h1>

            {message && <p className="stock-badge">{message}</p>}

            <div className="category-grid">
                {commandes.map(commande => {

                    return (
                        <div key={commande.id} className="card">
                            <h2 className="card-title">Commande #{commande.increment_id}</h2>
                            <p><strong>Client :</strong> {commande.customer_first_name} {commande.customer_last_name}</p>
                            <p><strong>Email :</strong>{commande.customer_email}</p>
                            <p><strong>Statut :</strong>{' '}{commande.status}</p>

                            <hr style={{ margin: '15px 0' }} />

                            <h3>Produits commandés</h3>

                            {(() => {
                                const items = Array.isArray(commande.items) ? commande.items : [commande.items];
                                return items.length > 0 ? items.map(item => (
                                    <div key={item.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                        <p><strong>Nom :</strong> {item.name}</p>
                                        <p><strong>SKU :</strong> {item.sku}</p>
                                        <p><strong>Quantité :</strong> {item.qty_ordered}</p>
                                        <p><strong>Prix :</strong> {item.formatted_price}</p>
                                        <p><strong>Total produit :</strong> {item.formatted_total}</p>
                                    </div>
                                )) : (
                                    <p>Aucun produit trouvé pour cette commande.</p>
                                );
                            })()}

                            <hr style={{ margin: '15px 0' }} />

                            <h2 className="card-price">
                                Total commande : {commande.formatted_grand_total}
                            </h2>

                            <p className="detail-sku">
                                Date : {commande.created_at}
                            </p>
                        </div>
                    )
                })}
            </div>

            {commandes.length === 0 && !loading && (
                <p className="text-center mt-20">
                    Aucune commande trouvée.
                </p>
            )}
        </div>
    )
}

export default ListeCommande