import JSZip from 'jszip'
import api_admin from '../api/api_admin'
import api_client from '../api/api_client'

class ImageImportService {
    async buildCategoryMap() {
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

    async importImages(zipFile, callbacks) {
        const { onProgress, onMessage, onLog } = callbacks || {}
        
        if (!zipFile) return
        
        if (onMessage) onMessage('Extraction du ZIP...')
        
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
            if (onLog) onLog({ sku: '---', status: 'info', msg: `${totalFiles} images trouvées dans le ZIP` })
            
            if (totalFiles === 0) {
                if (onMessage) onMessage('Aucune image trouvée dans le ZIP')
                return
            }

            const productsRes = await api_admin.get('/admin/catalog/products')
            const products = productsRes.data.data

            const productCatMap = await this.buildCategoryMap()
            console.log('[MAP] productCatMap final:', productCatMap)

            let processedCount = 0

            for (const [sku, imgData] of Object.entries(imageFiles)) {
                const product = products.find(p => p.sku === sku)
                if (!product) {
                    if (onLog) onLog({ sku, status: 'error', msg: 'Produit introuvable' })
                    processedCount++
                    if (onProgress) onProgress(Math.round((processedCount / totalFiles) * 100))
                    continue
                }

                const catIds = productCatMap[product.id] || []
                console.log(`[${sku}] product.id=${product.id} → catIds:`, catIds)

                if (catIds.length === 0) {
                    if (onLog) onLog({ sku, status: 'error', msg: 'Aucune catégorie trouvée — upload annulé' })
                    processedCount++
                    if (onProgress) onProgress(Math.round((processedCount / totalFiles) * 100))
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
                    formData.append('manage_stock', 1)
                    formData.append('short_description', detail.short_description || detail.name)
                    formData.append('description', detail.description || detail.name)
                    formData.append('images[files][]', file)
                    formData.append('channels[]', 1)
                    catIds.forEach(id => formData.append('categories[]', id))
                    
                    if (detail.inventories && detail.inventories.length > 0) {
                        detail.inventories.forEach(inv => {
                            formData.append(`inventories[${inv.inventory_source_id}]`, inv.qty || 0)
                        })
                    }

                    await api_admin.post(`/admin/catalog/products/${product.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })

                    if (onLog) onLog({ sku, status: 'success', msg: `Image OK — catégories: [${catIds.join(', ')}]` })
                } catch (e) {
                    console.error(`Erreur upload ${sku}:`, e.response?.data || e.message)
                    if (onLog) onLog({ sku, status: 'error', msg: e.response?.data?.message || e.message })
                }
                
                processedCount++
                if (onProgress) onProgress(Math.round((processedCount / totalFiles) * 100))
            }

            if (onMessage) onMessage('Importation des images terminée !')
        } catch (error) {
            console.error('Erreur import images:', error)
            if (onMessage) onMessage('Erreur : ' + error.message)
        }
    }
}

export default new ImageImportService()
