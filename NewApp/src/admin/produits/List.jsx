import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_admin from '../../api/api_admin'

function List() {
    const [produits, setProduits] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const fetchProduits = async () => {
        try {
            const response = await api_admin.get('/admin/catalog/products')
            setProduits(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProduits()
    }, [])

    const handleDelete = async (id) => {
        try {
            await api_admin.delete(`/admin/catalog/products/${id}`)
            setProduits(produits.filter(produit => produit.id !== id))
        } catch (error) {
            setMessage('Erreur lors de la suppression')
        }
    }

    const handleDeleteData = () =>{

    }

    
    const handleDeleteDataAll = async () => {
        if (!window.confirm('Supprimer TOUS les produits ?')) return
        produits.forEach(produit => {
            handleDelete(produit.id)
        })
        fetchProduits()
    }

    if (loading) return <div>Chargement...</div>

    return (
        <div style={{ padding: '20px' }}>
            <h1>Liste des Produits</h1>

            {message && <p style={{ color: 'green' }}>{message}</p>}

            <button
                onClick={() => navigate('/admin/produits/create')}
                style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '20px' }}
            >
                Créer un produit
            </button>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Nom</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>SKU</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Prix</th>
                        <th style={{ padding: '10px', border: '1px solid #ccc' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {produits.map(produit => (
                        <tr key={produit.id}>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{produit.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                                {produit.name || 
                                 produit.attribute_values?.find(v => v.attribute_id === 2)?.text_value || 
                                 "Sans nom"}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{produit.sku}</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{produit.price}</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc', display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={() => navigate(`/admin/produits/edit/${produit.id}`)}
                                    style={{ padding: '5px 10px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(produit.id)}
                                    style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    Supprimer
 
                                </button>
                            
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={() => handleDeleteData()}style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>Reinitialiser Donées 'seulement demo qui reste'</button>
            <button onClick={() => handleDeleteDataAll()}style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>Reinitialiser toutes les données </button>

        </div>
    )
}

export default List