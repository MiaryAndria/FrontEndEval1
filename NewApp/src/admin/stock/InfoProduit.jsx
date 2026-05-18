import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api_admin from '../../api/api_admin'
// import Stock from '../../services/SimulationCommande'
import '../css/admin_style.css'

function InfoProduit() {
    const { id } = useParams()
    // const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    // const [stockDetails, setStockDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')

    const fetchProductDetail = async () => {
        try {
            const response = await api_admin.get(`/admin/catalog/products/${id}`)
            setProduct(response.data.data)
        } catch (err) {
            console.error("Erreur détails produit:", err)
        }
    }

    // const fetchStock = async () => {
    //     try {
    //         return await Stock.getSingleProductStock(id);
    //     } catch (err) {
    //         console.error("Erreur fetch stock via simulation:", err)
    //         return 0
    //     }
    // }
    
    // const getAllOrder = async()=> {
    //     try{
    //         const response = await api_admin.get('/admin/sales/orders?limit=1000')
    //         return response.data.data

    //     } catch (err) {
    //         console.error("Erreur fetch stock via simulation:", err)
    //         return 0
    //     }
    // }
    
    // const fetchStatistics = async () => {
    //     try {

    //         const allOrders = await getAllOrder()
    //         let stats = { ordered: 0, invoiced: 0, shipped: 0, pending: 0 }
    //         allOrders.forEach(order => {
    //             if (order.status === 'canceled' || order.status === 'closed') return
    //             const item = order.items.find(i => i.product_id == id)
    //             if (item) {
    //                 const ordered = parseInt(item.qty_ordered) || 0
    //                 const invoiced = parseInt(item.qty_invoiced) || 0
    //                 const shipped = parseInt(item.qty_shipped) || 0
                    
    //                 stats.ordered += ordered
    //                 stats.invoiced += invoiced
    //                 stats.shipped += shipped
    //                 stats.pending += (ordered - shipped)
    //             } 
    //         })
    //         return stats
    //     } catch (err) {
    //         console.error("Erreur statistiques:", err)
    //         setError('Erreur lors du calcul des statistiques')
    //         return { ordered: 0, invoiced: 0, shipped: 0, pending: 0 }
    //     }
    // }

    const afficher = async () => {
        setLoading(true)

        // const stock = await fetchStock()
        // const stats = await fetchStatistics()
        await fetchProductDetail()

        // setStockDetails({
        //     total_stock: stock ,
        //     total_ordered: stats.ordered,
        //     total_invoiced: stats.invoiced,
        //     total_shipped: stats.shipped,
        //     pending: stats.pending,
        // })
        setLoading(false)
    }

    useEffect(() => {
        afficher()
    }, [id])

    if (loading) return <div className="client-container">Chargement des données...</div>
    // if (error) return <div className="client-container"><p className="stock-badge">{error}</p></div>

    return (
        <div className="client-container">

            <h1>Bilan Complet du Produit :</h1>
            <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>{product?.name}</h2>
            
            <div className="detail-layout">
                {/* Image et Infos */}
                <div className="card text-center" style={{ flex: 1 }}>
                    {product?.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} style={{ maxWidth: '100%', borderRadius: '10px' }} />
                    ) : (
                        <div style={{ height: '200px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Pas d'image</div>
                    )}
                    <h3 className="mt-20">SKU: {product?.sku}</h3>
                    <p className="text-muted">ID Système: {id}</p>
                </div>

                {/* Tableau de Stock */}
                <div style={{ flex: 2 }}>
                    <div className="card">
                        <h2 className="summary-divider">Flux d'Inventaire</h2>
                        
                        <table className="cart-items" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '15px' }}>État du Stock</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '15px' }}> Stock reel</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                                        {product.inventories?.[0]?.qty || 0}
                                    </td>
                                </tr>
                                {/* <tr style={{ borderBottom: '1px solid #f5f5f5', color: '#666' }}>
                                    <td style={{ padding: '15px' }}> Total Commandé (Brut)</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        {stockDetails?.total_ordered || 0}
                                    </td>
                                </tr> */}
                                {/* <tr style={{ borderBottom: '1px solid #f5f5f5', color: 'var(--primary-color)' }}>
                                    <td style={{ padding: '15px' }}>  Facturé (Payé)</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        {stockDetails?.total_invoiced || 0}
                                    </td>
                                </tr> */}
                                {/* <tr style={{ borderBottom: '1px solid #f5f5f5', color: 'var(--success-color)' }}>
                                    <td style={{ padding: '15px' }}>  Expédié (Vendu)</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        {stockDetails?.total_shipped || 0}
                                    </td>
                                </tr> */}
                                {/* <tr style={{ borderBottom: '1px solid #f5f5f5', color: 'var(--danger-color)' }}>
                                    <td style={{ padding: '15px' }}> En attente (À expédier)</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                         {stockDetails?.pending || 0}
                                    </td>
                                </tr> */}

                                <tr style={{ borderBottom: '1px solid #f5f5f5', color: 'var(--danger-color)' }}>
                                    <td style={{ padding: '15px' }}> Vendable rayon </td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                         {product.inventory_indices?.[0]?.qty || 0}
                                    </td>
                                </tr>

                            <Link
                                to={`/admin/stock/add/${product.id}`}
                                className="btn btn-outline"
                                style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '10px' }}
                            >
                                 <span style={{color: 'var(--text-color)'}}>Ajouter stock</span>
                            </Link>

                            </tbody>
                        </table>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InfoProduit
