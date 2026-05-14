import './css/admin_style.css'
import DeleteAll from './Delete'
import { Link } from 'react-router-dom'
import { Upload, ListOrdered, Image as ImageIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import api_admin from '../api/api_admin'

function Acceuil() {
    const [orderCount, setOrderCount] = useState(0)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api_admin.get('/admin/sales/orders')
                setOrderCount(res.data?.data?.length || 0)
            } catch (e) { console.error(e) }
        }
        fetchOrders()
    }, [])

    return (
        <div className="admin-container">
            <div className="admin-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1>Tableau de bord</h1>
                <p>Bienvenue dans votre espace d'administration central</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                
                <Link to="/import" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <Upload size={40} color="var(--primary-color)" />
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Importer CSV</h3>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>Importez vos produits, catégories et commandes via un fichier CSV.</p>
                </Link>

                <Link to="/image/import" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <ImageIcon size={40} color="var(--primary-color)" />
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Importer Images</h3>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>Chargez un fichier ZIP contenant les images de vos produits.</p>
                </Link>

                <Link to="/admin/commandes" className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer', position: 'relative' }}>
                    <ListOrdered size={40} color="var(--primary-color)" />
                    {orderCount > 0 && (
                        <span style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {orderCount}
                        </span>
                    )}
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Gérer Commandes</h3>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>Consultez, expédiez et facturez vos commandes clients.</p>
                </Link>

            </div>

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                <DeleteAll />
            </div>
        </div>
    )
}

export default Acceuil