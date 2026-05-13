import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api_admin from '../../api/api_admin'

function Edit() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [produit, setProduit] = useState({
        name: '',
        sku: '',
        url_key: '',
        price: '',
        weight: '',
        short_description: '',
        description: '',
        status: 1
    })
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const fetchProduit = async () => {
            try {
                const response = await api_admin.get(`/admin/catalog/products/${id}`)
                const data = response.data.data
                
                const getAttr = (attrId) => {
                    const attr = data.attribute_values?.find(v => v.attribute_id === attrId);
                    if (!attr) return "";
                    return attr.text_value || attr.float_value || attr.integer_value || "";
                };

                setProduit({
                    name: data.name || getAttr(2),
                    sku: data.sku || getAttr(1),
                    url_key: data.url_key || getAttr(3),
                    price: data.price || getAttr(11),
                    weight: data.weight || getAttr(22),
                    short_description: data.short_description || getAttr(9),
                    description: data.description || getAttr(10),
                    status: data.status ?? 1
                })
                setLoading(false)
            } catch (error) {
                setMessage('Erreur lors du chargement du produit')
                setLoading(false)
            }
        }
        fetchProduit()
    }, [id])

    const handleUpdate = async () => {
        try {
            await api_admin.put(`/admin/catalog/products/${id}`, {
                ...produit,
                price: Number(produit.price),
                weight: Number(produit.weight),
                channel: 'default',
                locale: 'en'
            })
            setMessage('Produit modifié avec succès !')
            setTimeout(() => navigate('/admin/produits/List'), 1500)
        } catch (error) {
            setMessage('Erreur lors de la modification')
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProduit(prev => ({ ...prev, [name]: value }))
    }

    if (loading) return <div>Chargement...</div>

    return (
        <div style={{ padding: '20px' }}>
            <h1>Modifier le Produit #{id}</h1>

            {message && <p style={{ color: 'green' }}>{message}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px' }}>
                <label>Nom</label>
                <input type="text" name="name" value={produit.name} onChange={handleChange} />

                <label>SKU</label>
                <input type="text" name="sku" value={produit.sku} onChange={handleChange} />

                <label>URL Key (Slug)</label>
                <input type="text" name="url_key" value={produit.url_key} onChange={handleChange} />

                <label>Prix</label>
                <input type="number" name="price" value={produit.price} onChange={handleChange} />

                <label>Poids (Weight)</label>
                <input type="number" name="weight" value={produit.weight} onChange={handleChange} />

                <label>Short Description</label>
                <textarea name="short_description" value={produit.short_description} onChange={handleChange}></textarea>

                <label>Description</label>
                <textarea name="description" value={produit.description} onChange={handleChange} style={{ height: '100px' }}></textarea>

                <label>Status (1 = Actif, 0 = Inactif)</label>
                <input type="number" name="status" value={produit.status} onChange={handleChange} />

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={handleUpdate} style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Sauvegarder
                    </button>
                    <button onClick={() => navigate('/admin/produits/List')} style={{ padding: '10px 20px', background: 'gray', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Edit
