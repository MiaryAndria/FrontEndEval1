import axios from 'axios'
const simAxios = axios.create({
    baseURL: '/sim_api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})

class Stock {
    constructor() {
        this.simToken = null
        this.loginPromise = null
        this.simulationLock = null
        this.stockCache = {}
        this.simEmail = 'sim.stock3@boutique.local'
        this.simPassword = 'SimCheck2026!'
    }

    async ensureSimulationUser() {
        if (this.simToken) {
            console.log('[STOCK] Token déjà en mémoire')
            return this.simToken
        }

        if (this.loginPromise) {
            console.log('[STOCK] Login déjà en cours, attente...')
            return this.loginPromise
        }

        this.loginPromise = this._doLogin()
        const token = await this.loginPromise
        this.loginPromise = null
        return token
    }

    async _doLogin() {
        console.log('[STOCK] Tentative de login simulation...')
        try {
            const loginRes = await simAxios.post('/customer/login', {
                email: this.simEmail,
                password: this.simPassword,
                device_name: 'stock_checker'
            })
            this.simToken = `Bearer ${loginRes.data.token}`
            console.log('[STOCK] Login réussi !', this.simToken)
            return this.simToken

        } catch (loginError) {
            console.log('[STOCK] Login échoué, création du compte...')
            try {
                await simAxios.post('/customer/register', {
                    first_name: 'Sim',
                    last_name: 'Checker',
                    email: this.simEmail,
                    password: this.simPassword,
                    password_confirmation: this.simPassword
                })
                const retryRes = await simAxios.post('/customer/login', {
                    email: this.simEmail,
                    password: this.simPassword,
                    device_name: 'stock_checker'
                })
                this.simToken = `Bearer ${retryRes.data.token}`
                console.log('[STOCK] Login réussi après création !', this.simToken)
                return this.simToken

            } catch (regError) {
                console.error('[STOCK] Erreur critique:', regError.response?.data || regError.message)
                this.simToken = null
                return null
            }
        }
    }

    async emptySimCart(token) {
        try {
            const cartRes = await simAxios.get('/customer/cart', {
                headers: { Authorization: token }
            })
            const items = cartRes.data?.data?.items || []
            console.log(`[STOCK] ${items.length} article(s) à vider`)
            for (let i = 0; i < items.length; i++) {
                try {
                    await simAxios.delete(`/customer/cart/remove/${items[i].id}`, {
                        headers: { Authorization: token }
                    })
                } catch (e) { }
            }
        } catch (e) {
            console.error('[STOCK] Erreur nettoyage panier:', e.response?.data || e.message)
        }
    }

    async tryQtyViaAdd(productId, qty, token) {
        await this.emptySimCart(token)
        try {
            const res = await simAxios.post(`/customer/cart/add/${productId}`, {
                product_id: productId,
                is_buy_now: 0,
                quantity: qty
            }, { headers: { Authorization: token } })

            const items = res.data?.data?.items || []
            const item = items.find(i => i.product_id == productId)
                || items.find(i => i.product?.id == productId)
                || items[items.length - 1]

            return item && parseInt(item.quantity) >= qty
        } catch (e) {
            return false
        }
    }

    async getMaxStock(productId) {
        console.log(`[STOCK] === Démarrage test stock produit ${productId} ===`)
        const token = await this.ensureSimulationUser()
        if (!token) {
            console.error('[STOCK] Abandon : pas de token')
            return 0
        }

        const noLimit = await this.tryQtyViaAdd(productId, 9999, token)
        if (noLimit) {
            await this.emptySimCart(token)
            console.warn(`[STOCK] Produit ${productId}: limite non enforced`)
            return -1
        }


        let low = 1, high = 500, maxStock = 0

        while (low <= high) {
            const mid = Math.floor((low + high) / 2)
            const success = await this.tryQtyViaAdd(productId, mid, token)
            if (success) {
                maxStock = mid
                low = mid + 1
            } else {
                high = mid - 1
            }
        }

        await this.emptySimCart(token)

        console.log(`[STOCK]  Produit ${productId} => Stock: ${maxStock}`)
        return maxStock
    }

    async getSingleProductStock(productId) {
        if (this.stockCache[productId] !== undefined) {
            console.log(`[STOCK] Cache hit produit ${productId} => ${this.stockCache[productId]}`)
            return this.stockCache[productId]
        }

        if (this.simulationLock) {
            await this.simulationLock
            if (this.stockCache[productId] !== undefined) {
                return this.stockCache[productId]
            }
        }

        let resolveLock
        this.simulationLock = new Promise(resolve => { resolveLock = resolve })

        try {
            const stock = await this.getMaxStock(productId)
            this.stockCache[productId] = stock
            return stock
        } finally {
            resolveLock()
            this.simulationLock = null
        }
    }

    // async getSingleProductStock(productId) {

    //     if (this.stockCache[productId] !== undefined) {
    //         console.log(`[STOCK NODE] Cache hit produit ${productId} => ${this.stockCache[productId]}`)
    //         return this.stockCache[productId]
    //     }

    //     try {
    //         const res = await axios.get(`http://localhost:3001/api/inventory/${productId}`)
    //         const stock = res.data.qty || 0
    //         this.stockCache[productId] = stock
    //         console.log(`[STOCK NODE] Produit ${productId} => ${stock}`)
    //         return stock
    //     } catch (e) {
    //         console.error(`[STOCK NODE] Erreur fetch stock pour produit ${productId}`, e)
    //         return 0
    //     }
    // }

    invalidateCache(productId) {
        if (productId) {
            delete this.stockCache[productId]
        } else {
            this.stockCache = {}
        }
    }
}

export default new Stock()