import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'
import axios from 'axios'
import Stock from '../../services/SimulationCommande'
function AjouterStock() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [quantiteAjouter, setQuantiteAjouter] = useState(0)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)

    const updateIndex = async (produitId) => {
        try {
            await axios.put(`http://localhost:3001/api/update/product-index/${produitId}`, {});
        } catch (idxErr) {
            console.error("Erreur de réindexation automatique", idxErr);
        }

    }

    const fetchProduit = async () => {
        try {
            const response = await api_admin.get(`/admin/catalog/products/${id}`)
            setProduct(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement du produit')
            setIsError(true)
            setLoading(false)
        }
    }
    
    const handleQuantiteChange = (val) => {
        const n = parseInt(val)
        if (isNaN(n) || n < 0) setQuantiteAjouter(0)
        else setQuantiteAjouter(n)
    }
    

    const handleAjouterStock = async () => {
    setSaving(true)
    setMessage('')  

    let total = 0;
        try {

            total = await Stock.getSingleProductStock(id);
        } catch (e) {
            console.error("Erreur récupération stock via simulation", e);
        }
        
        const quantityFinal = total + quantiteAjouter  

    try {
            await api_admin.post(`/admin/catalog/products/${id}/inventories`, {
                inventories: { "1": quantityFinal }
            })

            await updateIndex(id)
            Stock.invalidateCache(id);

            setMessage('Stock mis à jour avec succès !')
            setIsError(false)
            fetchProduit() 
            }catch(e){
                console.error(e.response?.data)
                setMessage('Erreur lors de la mise à jour du stock')
            }
            finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        fetchProduit()
    }, [id])

    if (loading) return <div className="client-container">Chargement...</div>

    if (!product) return (
        <div className="client-container">
            <p>Produit introuvable.</p>
            <button onClick={() => navigate('/admin/stock/list')}>Retour</button>
        </div>
    )

    return (
        <div className="client-container">
            <h1>Ajouter du stock</h1>

            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
                {product.images?.[0]?.url && (
                    <img src={product.images[0].url} alt={product.name}
                        style={{ width: '100%', marginBottom: '1rem', borderRadius: '8px' }} />
                )}

                <h2 className="card-title">{product.name}</h2>
                <p className="detail-sku">SKU : {product.sku}</p>
                <p className="detail-sku">Prix : {product.price} €</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <label style={{ fontWeight: '600' }}>Quantité à ajouter :</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleQuantiteChange(quantiteAjouter - 1)}
                            style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
                        >−</button>
                        <input
                            type="number"
                            min="0"
                            value={quantiteAjouter}
                            onChange={(e) => handleQuantiteChange(e.target.value)}
                            style={{ width: '80px', textAlign: 'center', padding: '0.5rem', fontSize: '1.1rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <button
                            onClick={() => handleQuantiteChange(quantiteAjouter + 1)}
                            style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
                        >+</button>
                    </div>
                </div>

                {message && (
                    <p style={{ color: isError ? '#c62828' : '#2e7d32', marginTop: '1rem', fontWeight: '500' }}>
                        {message}
                    </p>
                )}

                <button
                    onClick={handleAjouterStock}
                    disabled={saving || quantiteAjouter <= 0}
                    style={{
                        marginTop: '1.5rem', width: '100%', padding: '0.85rem',
                        background: quantiteAjouter > 0 ? 'var(--primary-color, #1976d2)' : '#ccc',
                        color: '#fff', border: 'none', borderRadius: '6px',
                        fontSize: '1rem', fontWeight: '600',
                        cursor: quantiteAjouter > 0 ? 'pointer' : 'not-allowed'
                    }}
                >
                    {saving ? 'Mise à jour...' : "Confirmer l'ajout de stock"}
                </button>
            </div>
        </div>
    )


}

export default AjouterStock