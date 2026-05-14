import { useState } from 'react'
import JSZip from 'jszip'
import api_admin from '../api/api_admin'
import api_client from '../api/api_client'
import './css/admin_style.css'

function ImageImport() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [zipFile, setZipFile] = useState(null)
    const [results, setResults] = useState([])
    const [progress, setProgress] = useState(0)

    const buildCategoryMap = async () => {
        const productCatMap = {}
        try {
            const catsRes = await api_admin.get('/admin/catalog/categories')
            const allCats = catsRes.data.data || []
    
            for (const cat of allCats) {
                if (cat.id === 1) continue
                try {
                    const res = await api_client.get(`/products?category_id=${cat.id}&sort=id&limit=200`)
                    const prods = res.data.data || []
                    prods.forEach(p => {
                        if (!productCatMap[p.id]) productCatMap[p.id] = []
                        if (!productCatMap[p.id].includes(cat.id)) {
                            productCatMap[p.id].push(cat.id)
                        }
                    })
                } catch (e) {
                    console.warn(`[MAP] Erreur catégorie ${cat.id}:`, e.message)
                }
            }
        } catch (e) {
            console.error('[MAP] Erreur chargement catégories:', e.message)
        }
        return productCatMap
    }

    const importImages = async () => {
        if (!zipFile) return
        setLoading(true)
        setProgress(0)
        setMessage('Extraction du ZIP...')
        setResults([])
        const logs = []

        try {
            const zip = await JSZip.loadAsync(zipFile)
            const imageFiles = {}

            for (const [path, entry] of Object.entries(zip.files)) {
                if (entry.dir) continue
                if (path.includes('__MACOSX') || path.includes('._') || path.startsWith('.')) continue
                const ext = path.split('.').pop().toLowerCase()
                if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) continue
                const fileName = path.split('/').pop()
                const sku = fileName.replace(/\.[^.]+$/, '')
                imageFiles[sku] = { entry, fileName, ext }
            }

            const totalFiles = Object.keys(imageFiles).length
            logs.push({ sku: '---', status: 'info', msg: `${totalFiles} images trouvées dans le ZIP` })
            
            if (totalFiles === 0) {
                setMessage('Aucune image trouvée dans le ZIP')
                setLoading(false)
                return
            }

            const productsRes = await api_admin.get('/admin/catalog/products')
            const products = productsRes.data.data

            const productCatMap = await buildCategoryMap()
            console.log('[MAP] productCatMap final:', productCatMap)

            let processedCount = 0

            for (const [sku, imgData] of Object.entries(imageFiles)) {
                const product = products.find(p => p.sku === sku)
                if (!product) {
                    logs.push({ sku, status: 'error', msg: 'Produit introuvable' })
                    processedCount++
                    setProgress(Math.round((processedCount / totalFiles) * 100))
                    continue
                }

                const catIds = productCatMap[product.id] || []
                console.log(`[${sku}] product.id=${product.id} → catIds:`, catIds)

                if (catIds.length === 0) {
                    logs.push({ sku, status: 'error', msg: 'Aucune catégorie trouvée — upload annulé' })
                    processedCount++
                    setProgress(Math.round((processedCount / totalFiles) * 100))
                    continue
                }

                try {
                    const detailRes = await api_admin.get(`/admin/catalog/products/${product.id}`)
                    const detail = detailRes.data.data

                    const blob = await imgData.entry.async('blob')
                    const file = new File([blob], imgData.fileName, {
                        type: `image/${imgData.ext === 'jpg' ? 'jpeg' : imgData.ext}`
                    })

                    const formData = new FormData()
                    formData.append('channel', 'default')
                    formData.append('locale', 'fr')
                    formData.append('_method', 'PUT')
                    formData.append('sku', product.sku)
                    formData.append('name', detail.name || product.sku)
                    formData.append('url_key', detail.url_key || product.sku.toLowerCase())
                    formData.append('price', detail.price || 0)
                    formData.append('weight', detail.weight || 1)
                    formData.append('status', 1)
                    formData.append('visible_individually', 1)
                    formData.append('short_description', detail.short_description || detail.name)
                    formData.append('description', detail.description || detail.name)
                    formData.append('images[files][]', file)
                    formData.append('channels[]', 1)
                    catIds.forEach(id => formData.append('categories[]', id))

                    await api_admin.post(`/admin/catalog/products/${product.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })

                    logs.push({ sku, status: 'success', msg: `Image OK — catégories: [${catIds.join(', ')}]` })
                } catch (e) {
                    console.error(`Erreur upload ${sku}:`, e.response?.data || e.message)
                    logs.push({ sku, status: 'error', msg: e.response?.data?.message || e.message })
                }
                
                processedCount++
                setProgress(Math.round((processedCount / totalFiles) * 100))
            }

            setMessage('Importation des images terminée !')
        } catch (error) {
            console.error('Erreur import images:', error)
            setMessage('Erreur : ' + error.message)
        }

        setResults(logs)
        setLoading(false)
        setProgress(0)
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1>Import Images</h1>
                <p>Mettez en ligne un fichier ZIP contenant les images de vos produits</p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {message && (
                    <div className={`alert ${message.includes('Erreur') ? 'alert-error' : ''}`}>
                        {message}
                    </div>
                )}

                <div className="form-group">
                    <label>Fichier ZIP (.zip)</label>
                    <input 
                        type="file" 
                        accept=".zip" 
                        onChange={(e) => setZipFile(e.target.files[0])}
                        className="input-field"
                    />
                </div>

                {loading && progress > 0 && (
                    <div style={{ width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, backgroundColor: 'var(--primary-color)', height: '100%', transition: 'width 0.3s ease' }}></div>
                    </div>
                )}

                <button 
                    className="btn btn-primary" 
                    onClick={importImages} 
                    disabled={loading || !zipFile}
                    style={{ width: '100%' }}
                >
                    {loading ? `Traitement en cours... ${progress}%` : 'LANCER L\'IMPORT'}
                </button>
            </div>

            {results.length > 0 && (
                <div className="card">
                    {results.map((r, i) => (
                        <div key={i} style={{ color: r.status === 'success' ? '#059669' : r.status === 'error' ? '#dc2626' : '#6b7280', padding: '0.25rem 0' }}>
                            [{r.sku}] {r.msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ImageImport