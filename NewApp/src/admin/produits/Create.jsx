import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api_admin from '../../api/api_admin'

function Create() {
    const navigate = useNavigate()
    const [produit, setProduit] = useState({
        type: 'simple',
        attribute_family_id: '1',
        sku: '',
        name: '',
        url_key: '',
        short_description: '',
        description: '',
        price: '',
        weight: ''
    })

    const handleCreate = async () => {
        try {
            await api_admin.post('/admin/catalog/products', {
                type: produit.type,
                attribute_family_id: Number(produit.attribute_family_id),
                sku: produit.sku,
                name: produit.name,
                url_key: produit.url_key || produit.name.toLowerCase().replace(/ /g, '-'),
                short_description: produit.short_description,
                description: produit.description,
                price: Number(produit.price),
                weight: Number(produit.weight),
                status: 1,
                visible_individually: 1
            })

            navigate('/admin/produits/List')
        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Erreurs de validation:', error.response.data)
                alert('Erreur: ' + JSON.stringify(error.response.data.errors || error.response.data.message))
            } else {
                console.error('Erreur lors de la création', error)
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProduit(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div>
            <h1>Créer un produit</h1>
            
            <label>Type:</label>
            <input type="text" name="type" value={produit.type} onChange={handleChange} />
            
            <label>Attribute Family ID:</label>
            <input type="text" name="attribute_family_id" value={produit.attribute_family_id} onChange={handleChange} />
            
            <label>SKU:</label>
            <input type="text" name="sku" value={produit.sku} onChange={handleChange} />
            
            <label>Nom:</label>
            <input type="text" name="name" value={produit.name} onChange={handleChange} />
            
            <label>URL Key (Slug):</label>
            <input type="text" name="url_key" value={produit.url_key} onChange={handleChange} />
            
            <label>Short Description:</label>
            <textarea name="short_description" value={produit.short_description} onChange={handleChange}></textarea>
            
            <label>Description:</label>
            <textarea name="description" value={produit.description} onChange={handleChange}></textarea>
            
            <label>Prix:</label>
            <input type="text" name="price" value={produit.price} onChange={handleChange} />
            
            <label>Poids (Weight):</label>
            <input type="text" name="weight" value={produit.weight} onChange={handleChange} />
            
            <button onClick={handleCreate}>Créer</button>
        </div>
    )
}

export default Create
