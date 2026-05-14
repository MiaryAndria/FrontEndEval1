import { useState } from 'react'
import api_admin from '../api/api_admin'
import api_node from '../api/api_node'

function ImportData() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [categorie, setCategories] = useState([])
    const [produit, setProduits] = useState([])
    const [client, setClients] = useState([])

    const getAllCategorie = async () => {
        const response = await api_admin.get('/admin/catalog/categories')
        const data = response.data.data
        return data
    }

    const getAllProduit = async () => {
        const response = await api_admin.get('/admin/catalog/products')
        const data = response.data.data
        return data
    }

    const getAllClients = async () => {
        const response = await api_admin.get('/admin/customers')
        const data = response.data.data
        return data
    }

    const deleteCategorie = async (categorie) => {
        const ids = categorie.map(c => c.id)
        await api_admin.post('/admin/catalog/categories/mass-destroy', {
            indices: ids
        })
    }

    const deleteProduit = async (produit) => {
        const ids = produit.map(p => p.id)
        await api_admin.post('/admin/catalog/products/mass-destroy', {
            indices: ids
        })
    }

    const deleteClient = async (client) => {
        const ids = client.map(c => c.id)
        await api_admin.post('/admin/customers/mass-destroy', {
            indices: ids,
        })
    }

    const deleteOrder = async () => {
        await api_node.delete('/api/reset_shipment_order_invoice')
    }

    const ResetData = async () => {
        if (!window.confirm('Réinitialiser toutes les données ?')) return
        setLoading(true)
        try {

            const categories = await getAllCategorie()
            const produits = await getAllProduit()
            const clients = await getAllClients()

            await deleteOrder()      
            await deleteClient(clients)     
            await deleteProduit(produits)    
            await deleteCategorie(categories)  

            setMessage(' Données réinitialisées avec succès !')
        } catch (error) {
            console.log(error)
            setMessage('Erreur lors de la réinitialisation')
        }
        setLoading(false)
    }

    return (
        <div>
            {message && <p>{message}</p>}
            <button 
                onClick={ResetData}
                disabled={loading}
                style={{ 
                    padding: '10px 20px', 
                    background: 'red', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer' 
                }}
            >
                {loading ? 'Import donnée .. ' : 'Importer des données'}
            </button>
        </div>
    )
}

export default ImportData