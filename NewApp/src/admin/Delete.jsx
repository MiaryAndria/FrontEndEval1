import { useState } from 'react'
import api_admin from '../api/api_admin'
import api_node from '../api/api_node'

function DeleteAll() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const getAllCategorie = async () => {
        const response = await api_admin.get('/admin/catalog/categories?limit=200')
        return response.data.data
    }

    const getAllProduit = async () => {
        const response = await api_admin.get('/admin/catalog/products?limit=200')
        return response.data.data
    }

    const getAllClients = async () => {
        const response = await api_admin.get('/admin/customers?limit=200')
        return response.data.data
    }

    const deleteCategorie = async (categories) => {
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].id === 1) continue;
            try {
                await api_admin.delete(`/admin/catalog/categories/${categories[i].id}`)
            } catch (e) {
                console.warn(`Catégorie ${categories[i].id} déjà absente.`);
            }
        }
    }

    const deleteProduit = async (produits) => {
        for (let i = 0; i < produits.length; i++) {
            try {
                await api_admin.delete(`/admin/catalog/products/${produits[i].id}`)
            } catch (e) {
                console.warn(`Produit ${produits[i].id} déjà absent.`);
            }
        }
    }

    const deleteClient = async (clients) => {
        for (let i = 0; i < clients.length; i++) {
            try {
                await api_admin.delete(`/admin/customers/${clients[i].id}`)
            } catch (e) {
                console.warn(`Client ${clients[i].id} déjà absent.`);
            }
        }
    }

    const deleteOrder = async () => {
        try {
            await api_node.delete('/api/reset_shipment_order_invoice')
        } catch (e) {
            console.error("Erreur reset ordres via Node")
        }
    }

    const ResetData = async () => {
        if (!window.confirm('Réinitialiser toutes les données ?')) return
        setLoading(true)
        setMessage('Réinitialisation en cours...')
        try {

            await deleteOrder()
            
            const clients = await getAllClients()
            await deleteClient(clients)
            
            const produits = await getAllProduit()
            await deleteProduit(produits)

            const categories = await getAllCategorie()
            await deleteCategorie(categories)

            setMessage(' Données réinitialisées avec succès !')
        } catch (error) {
            console.log(error)
            setMessage(' Erreur lors de la réinitialisation (voir console)')
        }
        setLoading(false)
    }

    return (
        <div style={{ padding: '30px', textAlign: 'center' }}>
            <h1>Nettoyage de la Base</h1>
            {message && (
                <p style={{ 
                    padding: '10px', 
                    color: message.includes(' Erreur') ? 'red' : 'green',
                    background: '#f0f0f0',
                    borderRadius: '5px'
                }}>
                    {message}
                </p>
            )}
            <button 
                onClick={ResetData}
                disabled={loading}
                style={{ 
                    padding: '15px 30px', 
                    background: 'red', 
                    color: 'white', 
                    border: 'none', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '5px'
                }}
            >
                {loading ? 'Traitement en cours...' : 'TOUT RÉINITIALISER'}
            </button>
        </div>
    )
}

export default DeleteAll
