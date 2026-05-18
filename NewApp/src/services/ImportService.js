import api_admin from '../api/api_admin';
import api_client from '../api/api_client';
import axios from 'axios';


class ImportService {
    constructor() {
        this.skuCategoryMap = {};
        this.skuToIdMap = {};
        this.inventorySourceId = null;
        this.channelId = null;
    }

    reset() {
        this.skuCategoryMap = {};
        this.skuToIdMap = {};
        this.inventorySourceId = null;
        this.channelId = null;
    }

    clean(val, defaultValue = '') {
        if (val === null || val === undefined) return defaultValue;
        let s = val.toString().trim();
        return s.replace(/^["']|["']$/g, '').replace(/""/g, '"');
    }

    cleanCSV(val, defaultValue = '') {
        if (val === null || val === undefined) return defaultValue;
        return val.toString().replace(/^["';,\s]+|["';,\s]+$/g, '').replace(/""/g, '"').trim();
    }

    cleanLower(val, defaultValue = '') {
        return this.cleanCSV(val, defaultValue).toLowerCase();
    }

    cleanNum(val, defaultValue = 0) {
        if (val === null || val === undefined) return defaultValue;
        const s = val.toString().replace(/["';,\s]/g, '').replace(',', '.');
        const n = parseFloat(s);
        return isNaN(n) ? defaultValue : n;
    }

    getVal(row, ...keys) {
        if (!row) return '';
        for (const k of keys) {
            const foundKey = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) return this.cleanCSV(row[foundKey]);
        }
        return '';
    }


    parseCSV(content, separator = 'auto') {
        const lines = content.split(/\r?\n/).map(l => l.trim()).filter(line => line !== '');
        if (lines.length === 0) return [];

        let usedSeparator = separator;
        if (usedSeparator === 'auto') {
            const sample = lines.slice(0, 5).join('\n');
            const counts = {
                ';': (sample.match(/;/g) || []).length,
                ',': (sample.match(/,/g) || []).length,
                '\t': (sample.match(/\t/g) || []).length,
            };
            usedSeparator = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            if (counts[usedSeparator] === 0) usedSeparator = ',';
        }

        const splitOutsideQuotes = (str, sep) => {
            const escapedSep = sep === '\t' ? '\\t' : sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`${escapedSep}(?=(?:(?:[^"]*"){2})*[^"]*$)`, 'g');
            return str.split(regex).map(v => {
                let s = v.trim();
                if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
                return s.replace(/""/g, '"');
            });
        };

        const splitRespectingBraces = (str) => {
            const parts = [];
            let depth = 0;
            let current = '';
            for (let i = 0; i < str.length; i++) {
                const c = str[i];
                if (c === '{') depth++;
                else if (c === '}') depth--;
                if (c === ',' && depth === 0) {
                    parts.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                    current = '';
                } else {
                    current += c;
                }
            }
            parts.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            return parts;
        };

        let headersRaw = lines[0].replace(/^\uFEFF/, '').split(usedSeparator).map(h => this.clean(h).replace(/[;,\s]+$/, ''));
        
        headersRaw.forEach(h => {
            if (/[^a-zA-Z0-9_\s\-éèàâêîôûäëïöüç]/i.test(h)) {
                throw new Error("Nom de colonne non conforme");
            }
        });

        const isHeader = headersRaw.some(h => /sku|nom|name|prix|price|stock|qty|client|email|achat|type/i.test(h));
        
        let dataLines = lines;
        let headers = headersRaw;
        
        if (isHeader) {
            dataLines = lines.slice(1);
        } else {
            headers = Array(headersRaw.length).fill(0).map((_, i) => `col_${i}`);
        }

        const knownTypes = ['simple', 'configurable', 'virtual', 'bundle', 'grouped', 'downloadable'];

        return dataLines.map((line, lineIdx) => {
            let values = splitOutsideQuotes(line, usedSeparator);

            if (values.length === 1 && values[0].includes(',')) {
                const inner = values[0].replace(/^"|"$/g, '');
                values = splitRespectingBraces(inner);
            }

            if (values.length < headers.length) {
                if (!knownTypes.includes(values[0].toLowerCase())) {
                    values.unshift('simple');
                }
                while (values.length < headers.length) values.push('');
            }

            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] !== undefined ? values[index] : '';
            });
            row._rawValues = values; 

            const dateVal = this.getVal(row, 'date', 'date_commande', 'order_date');
            if (dateVal && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateVal)) {
                throw new Error("format de date différente de DD/MM/YYYY");
            }

            const montantVal = this.getVal(row, 'prix_vente', 'prix', 'price', 'price_sale', 'vente', 'montant', 'total');
            if (montantVal) {
                const num = parseFloat(montantVal.replace(/['"\s]/g, '').replace(',', '.'));
                if (num < 0) {
                    throw new Error("montant negatif");
                }
            }

            return row;
        });
    }


    async getInventorySourceId() {
        if (this.inventorySourceId) return this.inventorySourceId;
        try {
            const res = await api_admin.get('/admin/settings/inventory-sources');
            const sources = res.data.data || [];
            const source = sources.find(s => s.code === 'default') || sources[0];
            this.inventorySourceId = source ? source.id : 1;
            console.log(`[IMPORT] Source d'inventaire détectée: ${this.inventorySourceId} (${source?.name})`);
            return this.inventorySourceId;
        } catch (e) {
            console.warn("[IMPORT] Impossible de récupérer les sources, fallback sur 1");
            return 1;
        }
    }

    async getChannelId() {
        if (this.channelId) return this.channelId;
        try {
            const res = await api_admin.get('/admin/settings/channels');
            const channels = res.data.data || [];
            const channel = channels.find(c => c.code === 'default') || channels[0];
            this.channelId = channel ? channel.id : 1;
            console.log(`[IMPORT] Channel détecté: ${this.channelId} (${channel?.name})`);
            return this.channelId;
        } catch (e) {
            console.warn("[IMPORT] Impossible de récupérer les channels, fallback sur 1");
            return 1;
        }
    }

    async insertCategorie(catInput) {
        let catName = 'Général'; 
        if (typeof catInput === 'string' && catInput.trim() !== '') {
            catName = catInput.trim();
        } else if (typeof catInput === 'object' && catInput !== null) {
            catName = this.getVal(catInput, 'Categorie', 'categorie', 'category', 'cat', 'col_3');
            if (!catName) {
                const rawVals = catInput._rawValues || Object.values(catInput);
                const strVals = rawVals.map(v => (v || '').toString().trim()).filter(v => v !== '');
                catName = strVals.find(v => !['simple', 'configurable', 'virtual', 'bundle'].includes(v.toLowerCase()) && isNaN(parseFloat(v)) && !v.includes('@') && !/^sk-|^ref-/i.test(v) && v.length > 2 && v.length < 30) || 'Général';
            }
        }

        try {
            const search = await api_admin.get('/admin/catalog/categories');
            const found = search.data.data.find(c => c.name?.toLowerCase() === catName.toLowerCase());
            if (found) return found.id;

            const res = await api_admin.post('/admin/catalog/categories', {
                locale: 'all', name: catName, status: 1, position: 1,
                display_mode: 'products_and_description', description: catName,
                slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                attributes: [1],
            });
            return res.data?.data?.id;
        } catch (e) {
            console.error(`Erreur Categorie ${catName}:`, e.message);
            return null; 
        }
    }

    async insertProduit(row, categoryId) {
        try {
            let sku = this.cleanCSV(this.getVal(row, 'sku', 'SKU', 'ref', 'reference', 'col_1'));
            let name = this.cleanCSV(this.getVal(row, 'name', 'nom', 'libelle', 'title', 'col_2'));
            let prixVenteRaw = this.cleanCSV(this.getVal(row, 'prix_vente', 'prix', 'price', 'price_sale', 'vente', 'col_4'));
            let stockRaw = this.cleanCSV(this.getVal(row, 'stock', 'stock_initial', 'quantité', 'quantite', 'qty', 'inventory'));
            let description = this.cleanCSV(this.getVal(row, 'description', 'desc', 'info')) || '';
            const rawVals = row._rawValues || Object.values(row);
            const strVals = rawVals.map(v => (v || '').toString().trim()).filter(v => v !== '');

            if (!sku) {
                sku = strVals.find(v => /^sk-|^ref-|^prod-/i.test(v)) ||
                    strVals.find(v => v.length >= 3 && v.length <= 15 && !v.includes(' ') && isNaN(parseFloat(v))) ||
                    `SKU-${Date.now()}`;
            }

            if (!name) {
                name = strVals.find(v => v !== sku && v.length > 4 && !['simple', 'configurable'].includes(v.toLowerCase()) && !v.includes('@')) || sku;
            }

            if (!description) description = name;

            if (prixVenteRaw === '' || prixVenteRaw === undefined) {
                const nums = strVals.map(v => parseFloat(v.replace(/['"\s]/g, '').replace(',', '.'))).filter(n => !isNaN(n));
                prixVenteRaw = nums.length > 0 ? Math.max(...nums) : 0;
            }

            let origineStock = 'en-tête';
            if (stockRaw === '' || stockRaw === undefined) {
                const nums = strVals.map(v => parseFloat(v.replace(/['"\s]/g, '').replace(',', '.'))).filter(n => !isNaN(n) && Number.isInteger(n));
                stockRaw = nums.length > 0 ? nums[nums.length - 1] : 0;
                origineStock = 'inférence';
            }

            const prixVente = this.cleanNum(prixVenteRaw);
            const prixPromo = this.cleanNum(this.getVal(row, 'prix_promo', 'promo', 'special_price'));
            const stock = this.cleanNum(stockRaw, 0);

            let weight = parseFloat(this.getVal(row, 'weight', 'poids', 'masse'));
            if (isNaN(weight) || weight <= 0) weight = 1;

            let status = parseInt(this.getVal(row, 'status', 'statut', 'actif', 'active'));
            if (isNaN(status)) status = 1;

            console.log(`[Analyse CSV] Produit: ${sku} | Stock brut lu: "${stockRaw}" (via ${origineStock}) => Stock final inséré: ${stock}`);

            if (!sku || !name) return;

            const search = await api_admin.get(`/admin/catalog/products?sku=${encodeURIComponent(sku)}`);
            const listProduct = search.data.data.find(p => p.sku.toLowerCase() === sku.toLowerCase());
            let productId;

            if (listProduct) {
                productId = listProduct.id;
            } else {
                const res = await api_admin.post('/admin/catalog/products', {
                    type: 'simple', attribute_family_id: 1, sku, status, visible_individually: 1,
                    manage_stock: 1,
                });
                productId = res.data.data.id;
            }

            const sourceId = await this.getInventorySourceId();
            const chanId = await this.getChannelId();

            const updateData = {
                channel: 'default', locale: 'fr', sku, name,
                url_key: sku.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                price: prixVente, weight, status, visible_individually: 1,
                short_description: description, description,
                manage_stock: 1,
                inventories: { [sourceId]: stock },
                // inventories: product.inventories,
                qty: stock,
                in_stock: stock > 0 ? 1 : 0,
                categories: categoryId ? [categoryId] : [],
                // categories: product.categories,
                channels: [chanId],
            }; 
            
            // const formatDateBagisto = (dateStr) => {
            //     if (!dateStr) return null;
            //     const match = dateStr.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
            //     if (match) return `${match[3]}-${match[2]}-${match[1]}`;
                
            //     return null;
            // };

            // const dateDebutRaw = this.cleanCSV(this.getVal(row, 'debut_promo'));
            // const dateFinRaw   = this.cleanCSV(this.getVal(row, 'fin_promo'));

            // let date_debut = formatDateBagisto(dateDebutRaw);
            // let date_fin   = formatDateBagisto(dateFinRaw);

            // Seulement si les DEUX dates sont présentes ET prixPromo > 0
            if (prixPromo > 0 ) {
                updateData.special_price      = prixPromo;
                // updateData.special_price_from = date_debut;
                // updateData.special_price_to   = date_fin;
            }

            // if (prixPromo > 0 && date_debut && date_fin) {
            //     updateData.special_price      = prixPromo;
            //     // updateData.special_price_from = date_debut;
            //     // updateData.special_price_to   = date_fin;
            // }

            try {
                await api_admin.put(`/admin/catalog/products/${productId}`, updateData);
                console.log(`[STOCK] Produit + inventaire mis à jour: ${sku} => ${stock} (Source: ${sourceId}, Channel: ${chanId})`);

                try {
                    await api_admin.post(`/admin/catalog/products/${productId}/inventories`, {
                        inventories: { [sourceId]: stock }
                    });
                    console.log(`[STOCK] Inventaire Bagisto forcé pour ${sku} avec ${stock} pièces.`);

                    await axios.put(`http://localhost:3001/api/update/product-index/${productId}`, {});
                } catch (idxErr) {
                    console.error("Erreur mise à jour inventaire:", idxErr);
                }
            } catch (e) {
                console.error(`[STOCK] Erreur update produit ${sku}:`, e.response?.data || e.message);
                throw e;
            }

            this.skuCategoryMap[sku] = categoryId;
            this.skuToIdMap[sku] = productId;
            console.log(`Produit traité : ${sku} | ID: ${productId} | Stock: ${stock}`);
        } catch (e) {
            console.error(`Erreur Produit ${this.getVal(row, 'sku')}:`, e.response?.data || e.message);
        }
    }
    async insertClient(row) {
        let email = this.cleanLower(this.getVal(row, 'email', 'Email', 'e-mail', 'mail', 'client', 'customer','e_mail'));
        let prenom = this.cleanCSV(this.getVal(row, 'prenom', 'first_name', 'firstname', 'prénom'));
        let nom = this.cleanCSV(this.getVal(row, 'nom', 'last_name', 'lastname', 'famille','name'));
        let password = this.cleanCSV(this.getVal(row, 'password', 'pwd', 'mdp', 'mot_de_passe','pswd'));
        const rawVals = row._rawValues || Object.values(row);
        const strVals = rawVals.map(v => (v || '').toString().trim()).filter(v => v !== '');

        if (!email || !email.includes('@')) {
            email = strVals.find(v => v.includes('@')) || '';
        }

        if (!email) return; 

        if (!prenom && !nom) {
            const names = strVals.filter(v => v !== email && !v.match(/^[0-9/:-]+$/));
            if (names.length > 0) prenom = names[0];
            if (names.length > 1) nom = names[1];
        }

        if (!prenom) prenom = email.split('@')[0];
        if (!nom) nom = 'Client';

        if (!password) {
            password = strVals.find(v => v.length >= 6 && /^[0-9]+$/.test(v)) || '1234567890';
        }
        if (password.length < 6) password = password.padEnd(6, '0');

        const payload = {
            first_name: prenom,
            last_name: nom,
            email, password, password_confirmation: password,
        };

        try {
            await api_client.post('/customer/register', payload);
            console.log(`[CLIENT] Créé: ${email}`);
        } catch (e) {
            const errorData = e.response?.data;
            if (errorData?.errors?.email?.[0]?.includes('already taken') || errorData?.message?.includes('already registered')) {
                console.info(`[CLIENT] Déjà existant: ${email}`);
            } else {
                console.error(`[ERREUR REGISTER] Email: ${email}`, errorData || e.message);
            }
        }
    }

    async isStockSufficient(orderItems) {
        return true;
    }

    async updateStockForItems(orderItems) {
    }

    async completeOrder(orderId) {
        try {
            const res = await api_admin.get(`/admin/sales/orders/${orderId}`);
            const order = res.data.data;
            if (!order?.items) return;

            const shipItems = {};
            const invoiceItems = {};
            let totalQty = 0;
            order.items.forEach(item => {
                shipItems[item.id] = { 1: item.qty_ordered };
                invoiceItems[item.id] = item.qty_ordered;
                totalQty += item.qty_ordered;
            });

            // Invoice d'abord, puis Shipment
            try {
                await api_admin.post(`/admin/sales/invoices/${order.id}`, {
                    invoice: { items: invoiceItems }, can_create_transaction: 1,
                });
            } catch (invErr) {
            
            }

            try {
                await api_admin.post(`/admin/sales/shipments/${order.id}`, {
                    shipment: { carrier_title: 'Livraison Standard', track_number: 'IMP-' + order.id, source: 1, total_qty: totalQty, items: shipItems },
                });
            } catch (shipErr) {
                
            }

            console.log(`Commande ${orderId} passée en COMPLETED`);
        } catch (e) { console.error(`Erreur CompleteOrder ${orderId}:`, e.response?.data || e.message); }
    }

    async processingOrder(orderId) {
        try {
            const res = await api_admin.get(`/admin/sales/orders/${orderId}`);
            const order = res.data.data;
            if (!order?.items) return;

            const invoiceItems = {};
            order.items.forEach(item => {
                invoiceItems[item.id] = item.qty_ordered;
            });

            try {
                await api_admin.post(`/admin/sales/invoices/${order.id}`, {
                    invoice: { items: invoiceItems }, can_create_transaction: 1,
                });
            } catch (invErr) {
            }

            console.log(`Commande ${orderId} passée en PROCESSING`);
        } catch (e) { console.error(`Erreur ProcessingOrder ${orderId}:`, e.response?.data || e.message); }
    }

    async processOrderLine(row, clientInfo) {
        try {
            let achatRaw = this.getVal(row, 'achat', 'purchase', 'items', 'achats', 'produits');
            let csvStatus = this.cleanLower(this.getVal(row, 'status', 'statut', 'etat'));
            let clientEmail = this.cleanLower(this.getVal(row, 'client', 'email', 'customer'));
            const rawVals = row._rawValues || Object.values(row);
            const strVals = rawVals.map(v => (v || '').toString().trim()).filter(v => v !== '');

            if (!achatRaw) {
                achatRaw = strVals.find(v => v.includes('[') || v.includes('{')) || '';
            }
            if (!csvStatus) {
                csvStatus = this.cleanLower(strVals.find(v => ['pending', 'processing', 'completed', 'canceled', 'closed'].includes(this.cleanLower(v))) || 'pending');
            }
            if (!clientEmail || !clientEmail.includes('@')) {
                clientEmail = strVals.find(v => v.includes('@')) || '';
            }

            console.log(`[COMMANDE] Client: ${clientEmail} | Status CSV: "${csvStatus}" | Achat brut: "${achatRaw?.substring(0, 80)}"`);

            achatRaw = achatRaw.replace(/[{}]/g, '');
            const items = [];
            const regex = /\["?(.*?)"?[; "]+(\d+)"?\]/g;
            let match;

            while ((match = regex.exec(achatRaw)) !== null) {
                const sku = this.clean(match[1]);
                const qty = parseInt(match[2]);
                if (sku && qty > 0) items.push({ sku, qty });
            }
            
            console.log(`[COMMANDE] Items parsés:`, items);
            if (items.length === 0) return;

            for (const item of items) {
                let productId = this.skuToIdMap[item.sku];
                
                if (!productId) {
                    const searchRes = await api_admin.get(`/admin/catalog/products?sku=${encodeURIComponent(item.sku)}`);
                    const product = searchRes.data.data?.find(p => p.sku.toLowerCase() === item.sku.toLowerCase());
                    if (!product) throw new Error(`Produit introuvable : ${item.sku}`);
                    productId = product.id;
                    this.skuToIdMap[item.sku] = productId;
                }

                console.log(`[DEBUG CART] SKU: ${item.sku} | ID: ${productId}`);

                try {
                    await api_client.post(`/customer/cart/add/${productId}`, {
                        quantity: item.qty, product_id: productId,
                    });
                } catch (cartErr) {
                    console.error(`[ERREUR CART] SKU: ${item.sku} | Qty Demandée: ${item.qty}`, cartErr.response?.data || cartErr.message);
                    throw cartErr;
                }
            }

            const addressRaw = this.getVal(row, 'address', 'adresse', 'address1') || this.getVal(clientInfo, 'address', 'adresse', 'address1') || 'Adresse Import';
            const cityRaw = this.getVal(row, 'city', 'ville') || this.getVal(clientInfo, 'city', 'ville') || 'Paris';
            const stateRaw = this.getVal(row, 'state', 'region', 'état', 'etat', 'province') || this.getVal(clientInfo, 'state', 'region', 'état', 'etat', 'province') || 'Île-de-France';
            const countryRaw = this.getVal(row, 'country', 'pays') || this.getVal(clientInfo, 'country', 'pays') || 'FR';
            const postcodeRaw = this.getVal(row, 'postcode', 'code_postal', 'zip') || this.getVal(clientInfo, 'postcode', 'code_postal', 'zip') || '75000';
            const phoneRaw = this.getVal(row, 'phone', 'telephone', 'tel') || this.getVal(clientInfo, 'phone', 'telephone', 'tel') || '0123456789';

            const adresse = {
                company_name: this.getVal(row, 'company', 'entreprise', 'societe') || this.getVal(clientInfo, 'company', 'entreprise', 'societe') || '',
                first_name: this.getVal(clientInfo, 'prenom', 'first_name') || clientEmail.split('@')[0] || 'User',
                last_name: this.getVal(clientInfo, 'nom', 'last_name') || 'User',
                email: clientEmail || 'import@test.com',
                address1: [addressRaw], 
                address: [addressRaw], 
                city: cityRaw, 
                state: stateRaw, 
                country: countryRaw, 
                postcode: postcodeRaw, 
                phone: phoneRaw,
            };

            try {
                await api_client.post('/customer/checkout/save-address', {
                    billing: { ...adresse, save_as_address: false, use_for_shipping: true },
                    shipping: { ...adresse, save_as_address: false },
                });
            } catch (err) {
                console.error(`[ERREUR ADRESSE] Pour ${clientEmail} :`);
                console.error(err.response?.data?.errors || err.response?.data || err.message);
                throw err;
            }
            await api_client.post('/customer/checkout/save-shipping', { shipping_method: 'free_free' });
            await api_client.post('/customer/checkout/save-payment', { payment: { method: 'cashondelivery' } });
            
            const resOrder = await api_client.post('/customer/checkout/save-order');
            const orderId = resOrder.data?.data?.id || resOrder.data?.data?.order?.id || resOrder.data?.order?.id;

            console.log(`[COMMANDE] Commande créée: ID=${orderId} | Statut cible: ${csvStatus}`);

            if (!orderId) return;
            
            const csvDate = this.cleanCSV(this.getVal(row, 'date', 'date_commande', 'order_date'));
            const csvHeure = this.cleanCSV(this.getVal(row, 'heure', 'heure_commande', 'time', 'hour'));
            if (csvDate) {
                try {
                    await axios.put(`http://localhost:3001/api/update/order-date/${orderId}`, {
                        date: csvDate,
                        heure: csvHeure || '00:00',
                    });
                    console.log(`[COMMANDE] Date mise à jour: ${csvDate} ${csvHeure || '00:00'}`);
                } catch (dateErr) {
                    console.error(`[COMMANDE] Erreur MAJ date:`, dateErr.message);
                }
            }

            if (csvStatus === 'completed') await this.completeOrder(orderId);
            else if (csvStatus === 'processing') await this.processingOrder(orderId);

            for (const item of items) {
                const pId = this.skuToIdMap[item.sku];
                if (pId) {
                    try {
                        await axios.put(`http://localhost:3001/api/update/product-index/${pId}`, {});
                        console.log(`[REINDEX] Index recalculé pour SKU ${item.sku} (ID ${pId}) après achat`);
                    } catch (idxErr) {
                        console.error(`[REINDEX ERREUR] SKU ${item.sku}:`, idxErr.message);
                    }
                }
            }

        } catch (e) { 
            console.error(`Erreur ProcessOrderLine (Email: ${row?.client || 'Inconnu'}):`, e.response?.data || e.message); 
        }
    }

    async importCommandes(rows, allClients = [], progressTracker) {
        const grouped = rows.reduce((acc, row) => {
            const rawVals = row._rawValues || Object.values(row);
            const strVals = rawVals.map(v => (v || '').toString().trim());
            let email = this.cleanLower(this.getVal(row, 'client', 'email', 'customer'));
            
            if (!email || !email.includes('@')) {
                email = this.cleanLower(strVals.find(v => v.includes('@')) || '');
            }

            if (email && email.includes('@')) {
                if (!acc[email]) acc[email] = [];
                acc[email].push(row);
            } else if (progressTracker) progressTracker.increment();
            return acc;
        }, {});

        for (const email of Object.keys(grouped)) {
            const clientRows = grouped[email];
            localStorage.removeItem('token_client');

            const clientInfo = allClients.find(c => this.cleanLower(this.getVal(c, 'email', 'client')) === email);
            let pwd = this.getVal(clientInfo, 'password', 'mdp') || '1234567890';
            if (pwd.length < 6) pwd = pwd.padEnd(6, '0');

            try {
                const loginRes = await api_client.post('/customer/login', { email, password: pwd, device_name: 'newapp' });
                localStorage.setItem('token_client', loginRes.data.token);
                for (const row of clientRows) {
                    try {
                        await this.processOrderLine(row, clientInfo);
                    } catch (err) {
                        console.error(`Erreur ligne commande pour ${email}:`, err.message);
                    } finally {
                        if (progressTracker) progressTracker.increment();
                    }
                }
            } catch (err) {
                console.error(`Echec login ${email}`);
                for (let i = 0; i < clientRows.length; i++) {
                    if (progressTracker) progressTracker.increment();
                }
            }
        }
    }
}

export default new ImportService();
 