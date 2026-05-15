import { useState } from 'react'
import api_admin from '../api/api_admin'
import api_node from '../api/api_node'

function DeleteAll() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [progress, setProgress] = useState(0)

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

    const deleteCategorie = async (categorieId) =>{
        await api_admin.delete(`/admin/catalog/categories/${categorieId}`)
    }

    const deleteProduit = async (produitId) =>{
        await api_admin.delete(`/admin/catalog/products/${produitId}`)
    }

    const deleteClient = async (clientId) =>{
        await api_admin.delete(`/admin/customers/${clientId}`)
    }

    const ResetData = async () => {
        if (!window.confirm('Réinitialiser toutes les données ?')) return
        setLoading(true)
        setProgress(0)
        setMessage('Calcul des données à supprimer...')
        
        try {

            const clients = await getAllClients()
            const produits = await getAllProduit()
            const categories = await getAllCategorie()
            
            const totalItems = clients.length + produits.length + (categories.length - 1) + 1; 
            let processedItems = 0;

            const updateProgress = () => {
                processedItems++;
                setProgress(Math.round((processedItems / totalItems) * 100));
            };

            setMessage('Suppression des commandes...')
            await api_node.delete('/api/reset_shipment_order_invoice')
            updateProgress()


            setMessage('Suppression des clients...')
            for (let i =0;i<clients.length;i++){
            await deleteClient(clients[i].id)
            updateProgress()
            }

            setMessage('Suppression des produits...')
            for(let i=0;i<produits.length;i++){
            await deleteProduit(produits[i].id)
            updateProgress()
            }

            setMessage('Suppression des catégories...')
            for(let i=0;i<categories.length;i++){
            if (categories[i].id ===1) continue 
            await deleteCategorie(categories[i].id)
            updateProgress()
            }

            setMessage('Données réinitialisées avec succès !')
        } catch (error) {
            console.log(error)
            setMessage('Erreur lors de la réinitialisation (voir console)')
        }
        setLoading(false)
        setProgress(0)
    }

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', border: '1px solid var(--error-color)' }}>
            <h2 style={{ color: 'var(--error-color)' }}>Zone de Danger</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Nettoyage complet de la base de données (catégories, produits, clients, commandes).</p>
            
            {message && (
                <div className={`alert ${message.includes('Erreur') ? 'alert-error' : ''}`} style={{ backgroundColor: message.includes('Erreur') ? '' : '#ecfdf5', color: message.includes('Erreur') ? '' : '#059669', border: message.includes('Erreur') ? '' : '1px solid #a7f3d0' }}>
                    {message}
                </div>
            )}

            {loading && progress > 0 && (
                <div style={{ width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ width: `${progress}%`, backgroundColor: 'var(--error-color)', height: '100%', transition: 'width 0.3s ease' }}></div>
                </div>
            )}

            <button 
                className="btn"
                onClick={ResetData}
                disabled={loading}
                style={{ 
                    backgroundColor: 'var(--error-color)',
                    color: 'white',
                    width: '100%',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? `Réinitialisation... ${progress}%` : 'TOUT RÉINITIALISER'}
            </button>
        </div>
    )
}

export default DeleteAll
