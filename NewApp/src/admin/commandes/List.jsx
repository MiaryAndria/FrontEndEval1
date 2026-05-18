import { useState, useEffect } from 'react'
import api_admin from '../../api/api_admin'
import axios from 'axios'
// import Stock from '../../services/SimulationCommande'
import '../css/admin_style.css'

function CommandeAdmin() {
    const [commandes, setCommandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    const updateIndex = async(productId) =>{
        try{
            await axios.put(`http://localhost:3001/api/update/product-index/${productId}`, {});

        }catch(err){

        }
    }

    const fetchCommandes = async () => {
        try {
            const response = await api_admin.get('/admin/sales/orders')
            setCommandes(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des Commandes')
            setLoading(false)
        }
    }

    const ShipOrder = async (order) => {
        try {
            const items = {}
            order.items.forEach(item => {
                items[item.id] = {
                    1: item.qty_ordered
                }
            })
            const totalQty = order.items.reduce(
                (sum, item) => sum + item.qty_ordered,
                0
            )
            await api_admin.post(`/admin/sales/shipments/${order.id}`, {
                shipment: {
                    carrier_title: "DHL Shipment",
                    track_number: "12345",
                    source: 1,
                    total_qty: totalQty,
                    items: items
                }
            })
            
            try {
                for (const item of order.items) {
                    await updateIndex(item.product_id)
                    // Stock.invalidateCache(item.product_id);
                }
            } catch (idxErr) {
                console.error("Erreur réindexation", idxErr);
            }

            setMessage("Commande expédiée")
            fetchCommandes()
        } catch (error) {
            console.log(error.response?.data)
            setMessage("Erreur lors de l'expédition")
        }
    }

    const InvoiceOrder = async (order) => {
        try {
            const items = {}
            order.items.forEach(item => {
                items[item.id] = item.qty_to_invoice || item.qty_ordered
            })

            await api_admin.post(`/admin/sales/invoices/${order.id}`, {
                invoice: {
                    items: items
                },
                can_create_transaction: 1
            })

            try {
                for (const item of order.items) {
                    await updateIndex(item.product_id)
                    // Stock.invalidateCache(item.product_id);
                }
            } catch (idxErr) {
                console.error("Erreur réindexation", idxErr);
            }

            setMessage('Commande facturée')
            fetchCommandes()

        } catch (error) {
            console.log(error.response?.data)
            setMessage('Erreur lors de la facturation')
        }
    }

    useEffect(() => {
        fetchCommandes()
    }, [])


    if (loading) return <div className="loading-container">Chargement...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Gestion des Commandes</h1>
                <span style={{ color: 'var(--text-muted)' }}>{commandes.length} commandes trouvées</span>
            </div>

            {message && (
                <div className={`alert ${message.includes('Erreur') ? 'alert-error' : ''}`} style={{ backgroundColor: message.includes('Erreur') ? '' : '#ecfdf5', color: message.includes('Erreur') ? '' : '#059669', border: message.includes('Erreur') ? '' : '1px solid #a7f3d0' }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {commandes.map(order => (
                    <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>ORD-{order.increment_id}</span>
                            <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '999px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600',
                                backgroundColor: order.status === 'completed' ? '#ecfdf5' : order.status === 'pending' ? '#fffbeb' : '#f8fafc',
                                color: order.status === 'completed' ? '#059669' : order.status === 'pending' ? '#d97706' : '#64748b'
                            }}>
                                {order.status_label}
                            </span>
                        </div>

                        <div>
                            <h3 style={{ margin: '0 0 0.25rem 0' }}>{order.customer_first_name} {order.customer_last_name}</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{order.customer_email}</p>
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Articles</span>
                                <strong>{order.total_item_count}</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total</span>
                                <strong>{order.formatted_grand_total}</strong>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                            <button 
                                className="btn btn-outline" 
                                style={{ flex: 1, padding: '0.5rem' }} 
                                onClick={() => ShipOrder(order)} 
                                disabled={order.status === 'completed' || order.status === 'shipped' || order.status === 'closed'}
                            >
                                Expédier
                            </button>
                            <button 
                                className="btn btn-primary" 
                                style={{ flex: 1, padding: '0.5rem' }} 
                                onClick={() => InvoiceOrder(order)} 
                                disabled={order.status === 'completed' || order.status === 'closed' || order.status === 'processing' || order.status === 'invoices'}
                            >
                                Facturer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {commandes.length === 0 && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Aucune commande trouvée.</p>
                </div>
            )}
        </div>
    )
}

export default CommandeAdmin
