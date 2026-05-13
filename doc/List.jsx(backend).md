import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'

function CommandeAdmin() {
    const [commandes, setCommandes] = useState([])
    const [categorie,setCategories]=useState([])
    const [produit,setProduits]=useState([])
    const [order,setOrders]=useState([])
    const [invoice,setInvoices]=useState([])
    const [client,setClients]=useState([])
    const [shipment,setShipments]=useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

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
            const items = []
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
            setMessage("Commande expédiée")
            fetchCommandes()
        } catch (error) {
            console.log(error.response?.data)
            setMessage("Erreur lors de l'expédition")
        }
    }

    const InvoiceOrder = async (order) => {
    try {
            const items = []
            order.items.forEach(item => {
                items[item.id] = item.qty_to_invoice || item.qty_ordered
            })

            await api_admin.post(`/admin/sales/invoices/${order.id}`, {
                invoice: {
                    items: items
                },
                can_create_transaction: 1
            })

            setMessage('Commande facturée')
            fetchCommandes()

        } catch (error) {
            console.log(error.response?.data)
            setMessage('Erreur lors de la facturation')
        }
    }

    const getAllCategorie = async ()=>{
        try {
            const response = await api_admin.get('/admin/catalog/categories')
            setCategories(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des Catégories')
            setLoading(false)
        }
        
    }
    
    const getAllProduit = async ()=>{
        try {
            const response = await api_admin.get('/admin/catalog/products')
            setProduits(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des Produits')
            setLoading(false)
        }
        
    }


    const getAllOrder = async ()=>{
        try {
            const response = await api_admin.get('/admin/sales/orders')
            setOrders(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
        
    }

    const getAllInvoice = async ()=>{
        try {
            const response = await api_admin.get('/admin/sales/invoices')
            setInvoices(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
        
    }

    const getAllClients = async ()=>{
        try {
            const response = await api_admin.get('/admin/customers')
            setClients(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
        
    }

    const getAllShipment = async ()=>{
        try {
            const response = await api_admin.get('/admin/sales/shipments')
            setShipments(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
        
    }

    const deleteCategorie = async (categorieId) =>{
        try {
            for (let i = 0 ;i<categorie.length;i++){
            await api_admin.delete(`/admin/catalog/categories/${categorie[i].id}`, {   
            })
            setMessage('Categorie supprimé')
            }
        } catch (error) {
            console.log(error.response?.data)
            setMessage('Erreur lors du suppression')
        }


    }
    const deleteProduit = async () =>{
        try{
            for (let i = 0;i<produit.length;i++){
            await api_admin.delete(`/admin/catalog/products/${produit[i].id}`, {   
            })
            setMessage('Produit supprimé')
            }

        }catch(error){
            console.log(error.response?.data)
            setMessage('Erreur lors du suppression')
        }

    }

    const deleteOrder = async () =>{
        try{
            for(let i =0;i<order.length;i++){
            await api_admin.delete(`/admin/catalog/categories/${order[i].id}`, {   
            })
            setMessage('Order supprimé')
            }
        }catch(error){
            console.log(error.response?.data)
            setMessage('Erreur lors du suppression')
        }
    }

    const deleteClient =async() =>{
        try{
            for(let i=0;i<client.length;i++){
            await api_admin.delete(`/admin/customers/${client[i].id}`, {   
            })
            setMessage('Client supprimé')
            }
        }catch(error){
            console.log(error.response?.data)
            setMessage('Erreur lors du suppression')
        }

    }

    const deleteShipement =async() =>{
        try{
            for(let i=0;i<shipment.length;i++){
            await api_admin.delete(`/admin/customers/${shipment[i].id}`, {   
            })
            setMessage('Shipement supprimé')
            }
        }catch(error){
            console.log(error.response?.data)
            setMessage('Erreur lors du suppression')
        }

    }

    const deleteInvoice =async() =>{
        try{
            for(let i=0;i<invoice.length;i++){
            await api_admin.delete(`/admin/customers/${invoice[i].id}`, {   
            })
            setMessage('Invoice supprimé')
            }
        }catch(error){
            console.log(error.response?.data)
            setMessage('Erreur lors du suppression')
        }

    }

    const ResetData = ()=>{
        {
            await deleteCategorie()
            await deleteProduit()
            await deleteOrder()
            await deleteInvoice()
            await deleteClient()
            await deleteShipement()

            setMessage('Donnée reinitialiser')

        }
    }

    useEffect(() => {
        fetchCommandes()
    }, [])


    if (loading) return <div className="loading-container">Chargement...</div>

    return (
        <div className="admin-container">
            <button onClick={ResetData}>Reinitialiser toutes les données</button>
            <div className="admin-header">
                <h1 className="admin-title">Commandes</h1>
            </div>

            {message && (
                <div className={`message-box ${message.includes('Erreur') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="order-grid">
                {commandes.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="card-header">
                            <span className="order-number">ORD-{order.increment_id}</span>
                            <span className={`status-badge status-${order.status}`}>
                                {order.status_label}
                            </span>
                        </div>

                        <h2 className="customer-name">{order.customer_first_name} {order.customer_last_name}</h2>
                        <p className="customer-email">{order.customer_email}</p>

                        <div className="card-divider"></div>

                        <div className="order-stats">
                            <div className="stat-group">
                                <span className="stat-label">Articles</span>
                                <span className="stat-value">{order.total_item_count}</span>
                            </div>
                            <div className="stat-group">
                                <span className="stat-label">Total</span>
                                <span className="stat-value">{order.formatted_grand_total}</span>
                            </div>
                        </div>

                        <div className="order-date">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </div>

                        <div className="order-actions">
                            <button className="btn-minimal" onClick={() => ShipOrder(order)}disabled={order.status === 'completed' || order.status === 'shipped'}>
                                Envoyer
                            </button>
                            <button className="btn-minimal" onClick={() => InvoiceOrder(order)}disabled={order.status === 'completed' || order.status === 'pending'}>
                                Payer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {commandes.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: '60px', color: '#ccc' }}>
                    <p style={{ fontSize: '18px' }}>Aucune commande trouvée.</p>
                </div>
            )}
        </div>
    )
}

export default CommandeAdmin
