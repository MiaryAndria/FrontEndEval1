import { useState, useRef } from 'react'
import api_admin from '../api/api_admin'
import api_client from '../api/api_client'
import './css/admin_style.css'
import ContentImport from './ContentImport'

function ImportData() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [separator, setSeparator] = useState('auto')
    const [file1, setFile1] = useState(null)
    const [file2, setFile2] = useState(null)
    const [file3, setFile3] = useState(null)
    const [importedProducts, setImportedProducts] = useState([])
    const [importedClients, setImportedClients] = useState([])
    const [importedOrders, setImportedOrders] = useState([])
    const [importedCategories, setImportedCategories] = useState([])
    const stockMap = useRef({})

    const clean = (val, defaultValue = '') => {
        if (val === null || val === undefined) return defaultValue;
        let s = val.toString()
            .replace(/^[\s"'{}]+|[\s"'{}]+$/g, '')
            .replace(/""/g, '"')
            .replace(/^"|"$/g, '')                
            .trim();
        return s || defaultValue;
    };

    const cleanLower = (val, defaultValue = '') => clean(val, defaultValue).toLowerCase();
    const cleanNum = (val, defaultValue = 0) => {
        if (val === null || val === undefined) return defaultValue;
        const s = val.toString().replace(/["'\s]/g, '').replace(',', '.');
        const n = parseFloat(s);
        return isNaN(n) ? defaultValue : n;
    };

    const getVal = (row, ...keys) => {
        if (!row || typeof row !== 'object') return '';
        const normalize = (s) => s.toLowerCase().replace(/[\s_\-]/g, '');
        for (const key of keys) {
            const foundKey = Object.keys(row).find(k => normalize(k) === normalize(key));
            if (foundKey) {
                const val = clean(row[foundKey]);
                if (val) return val;
            }
        }
        return '';
    };

    const getProductStock = (sku) => {
        if (stockMap.current[sku] !== undefined) return stockMap.current[sku];
        return 0;
    };

    const parseCSV = (content) => {
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return [];
        let usedSeparator = separator;
        if (usedSeparator === 'auto') {
            const firstLine = lines[0];
            if (firstLine.includes(';')) usedSeparator = ';';
            else if (firstLine.includes('\t')) usedSeparator = '\t';
            else usedSeparator = ',';
        }
        const rawHeaders = lines[0].replace(/^\uFEFF/, '').split(usedSeparator);
        const headers = rawHeaders.map(h => clean(h)).filter(h => h !== '');
        return lines.slice(1).map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') inQuotes = !inQuotes;
                else if (char === usedSeparator && !inQuotes) {
                    values.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] !== undefined ? values[index] : '';
            });
            return row;
        });
    }

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });
    }

    const InsertProduit = async (row) => {
        try {
            const sku = getVal(row, 'sku', 'SKU', 'code', 'ref') || `SKU-${Math.floor(Math.random() * 100000)}`;
            const name = getVal(row, 'name', 'nom', 'product_name', 'produit', 'designation') || sku;
            const prixVente = cleanNum(getVal(row, 'prix_vente', 'price', 'prix', 'selling_price'), 10);
            const prixPromo = cleanNum(getVal(row, 'prix_promo', 'special_price', 'promo'));
            const stock = cleanNum(getVal(row, 'stock_initial', 'stock', 'quantity', 'qty'), 0);
            const description = getVal(row, 'description', 'desc') || name;
            const type = cleanLower(getVal(row, 'type'), 'simple');

            const res = await api_admin.post('/admin/catalog/products', {
                type: type, attribute_family_id: 1,
                sku: sku, status: 1, visible_individually: 1
            });
            const productId = res.data.data.id;

            const updateData = {
                channel: 'default',
                locale: 'fr', 
                sku: sku,
                name: name,
                url_key: sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                price: prixVente,
                weight: 1,
                status: 1,
                visible_individually: 1,
                short_description: description,
                description: description,
                inventories: { 1: stock }
            };

            if (prixPromo > 0) {
                updateData.special_price = prixPromo;
            }

            await api_admin.put(`/admin/catalog/products/${productId}`, updateData);
            stockMap.current[sku] = stock;
            console.log(` Produit créé : ${sku} avec stock ${stock}`);
        } catch (e) {
            console.error(` Erreur création produit ${getVal(row, 'sku')}:`, e.response?.data || e.message);
        }
    }

    const InsertCategorie = async (catName) => {
        if (!catName) return;
        try {
            await api_admin.post('/admin/catalog/categories', {
                locale: 'all',name: catName,status: 1,
                position: 1,display_mode: 'products_and_description',
                description: catName,slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                attributes: [1]
            });
        } catch (e) { }
    }

    const InsertClient = async (row) => {
        const email = cleanLower(
            getVal(row, 'email', 'Email', 'e-mail', 'mail') ||
            getVal(row, 'client')
        );
        if (!email || !email.includes('@')) return;

        let password = getVal(row, 'password', 'pwd', 'mdp', 'mot_de_passe') || "1234567890";
        if (password.length < 6) password = password.padEnd(6, '0');

        try {
            await api_client.post('/customer/register', {
                first_name: getVal(row, 'prenom', 'first_name', 'firstname', 'prénom') || 'User',
                last_name: getVal(row, 'nom', 'last_name', 'lastname', 'famille') || 'User',
                email: email,password: password,password_confirmation: password
            });
        } catch (e) { }
    }

    const CompleteOrder = async (orderId) => {
        try {
            const res = await api_admin.get(`/admin/sales/orders/${orderId}`);
            const order = res.data.data;
            if (!order || !order.items) {
                console.error('CompleteOrder: commande introuvable', orderId);
                return;
            }

            const shipItems = {};
            const invoiceItems = {};
            let totalQty = 0;
            order.items.forEach(item => {
                shipItems[item.id] = { 1: item.qty_ordered };
                invoiceItems[item.id] = item.qty_ordered;
                totalQty += item.qty_ordered;
            });

            await api_admin.post(`/admin/sales/shipments/${order.id}`, {
                shipment: {
                    carrier_title: "Livraison Standard", track_number: "IMP-" + order.id, source: 1,
                    total_qty: totalQty, items: shipItems
                }
            });
            console.log(` Shipment créé pour commande ${order.id} (${totalQty} unités)`);

            await api_admin.post(`/admin/sales/invoices/${order.id}`, {
                invoice: { items: invoiceItems },
                can_create_transaction: 1
            });
            console.log(` Invoice créée pour commande ${order.id} → COMPLETED`);

            for (const item of order.items) {
                try {
                    const prodRes = await api_admin.get(`/admin/catalog/products/${item.product_id}`);
                    const p = prodRes.data.data;

                    const name = p.name || p.translations?.find(t => t.name)?.name || item.sku;
                    const urlKey = p.url_key || p.translations?.find(t => t.slug)?.slug || p.sku.toLowerCase();
                    
                    const currentStock = getProductStock(item.sku);
                    const newQty = Math.max(0, currentStock - item.qty_ordered);

                    await api_admin.put(`/admin/catalog/products/${item.product_id}`, {
                        channel: 'default', locale: 'fr', sku: p.sku, name: name, url_key: urlKey, price: p.price || 0,
                        weight: p.weight || 1, short_description: p.short_description || name, description: p.description || name,
                        status: 1, visible_individually: 1,
                        inventories: { 1: newQty }
                    });
                    
                    stockMap.current[item.sku] = newQty;
                    console.log(` Stock ${item.sku}: ${currentStock} → ${newQty} (-${item.qty_ordered})`);
                } catch (invErr) {
                    console.error(` Erreur stock ${item.sku}:`, invErr.response?.data || invErr.message);
                }
            }
        } catch (e) {
            console.error(' Erreur CompleteOrder:', e.response?.data || e.message);
        }
    }

    const ProcessOrderLine = async (row, clientInfo) => {
        try {
            const items = [];
            const regex = /\["?(.*?)"?\s*[; ]+(\d+)\]/g;
            let match;
            let achatRaw = getVal(row, 'achat', 'purchase', 'items', 'achats');
            achatRaw = achatRaw.replace(/[{}]/g, ''); 

            while ((match = regex.exec(achatRaw)) !== null) {
                const sku = clean(match[1]);
                const qty = parseInt(match[2]);
                if (sku && qty > 0) items.push({ sku, qty });
            }
            if (items.length === 0) return;

            for (const item of items) {
                const searchRes = await api_admin.get(`/admin/catalog/products?sku=${item.sku}`);
                const listProduct = searchRes.data.data?.[0];
                if (!listProduct) {
                    throw new Error(`Produit introuvable : ${item.sku}`);
                }

                const prodRes = await api_admin.get(`/admin/catalog/products/${listProduct.id}`);
                const product = prodRes.data.data;

                const currentStock = getProductStock(item.sku);
                
                if (currentStock < item.qty) {
                    console.warn(`⚠️ Stock insuffisant pour ${item.sku} (Disponible: ${currentStock}, Demandé: ${item.qty})`);
                }

                await api_client.post(`/customer/cart/add/${product.id}`, {
                    quantity: item.qty,
                    product_id: product.id
                });
            }

            const clientEmail = cleanLower(getVal(row, 'client', 'email'));
            const adresse = {
                first_name: getVal(clientInfo, 'prenom', 'first_name', 'firstname') || 'User',
                last_name: getVal(clientInfo, 'nom', 'last_name', 'lastname') || 'User',
                email: clientEmail,
                address: ['Adresse Import'],
                city: getVal(row, 'city', 'ville') || getVal(clientInfo, 'city', 'ville') || 'City',
                state: getVal(row, 'state', 'region') || getVal(clientInfo, 'state', 'region') || 'State',
                country: getVal(row, 'country', 'pays') || getVal(clientInfo, 'country', 'pays') || 'FR',
                postcode: getVal(row, 'postcode', 'code_postal', 'zip') || getVal(clientInfo, 'postcode', 'zip') || '00000',
                phone: getVal(row, 'phone', 'telephone', 'tel') || getVal(clientInfo, 'phone', 'telephone', 'tel') || '0000000000'
            };

            await api_client.post('/customer/checkout/save-address', {
                billing: { ...adresse, save_as_address: false, use_for_shipping: true },
                shipping: { ...adresse, save_as_address: false }
            });
            await api_client.post('/customer/checkout/save-shipping', { shipping_method: 'free_free' });
            await api_client.post('/customer/checkout/save-payment', { payment: { method: 'cashondelivery' } });

            const resOrder = await api_client.post('/customer/checkout/save-order');
            console.log(' save-order response:', JSON.stringify(resOrder.data));


            const orderId = resOrder.data?.data?.id
                || resOrder.data?.data?.order?.id
                || resOrder.data?.order?.id;

            const csvStatus = cleanLower(getVal(row, 'status'));
            console.log(`Commande créée ID: ${orderId} | Status CSV: ${csvStatus}`);

            if (csvStatus === 'completed' && orderId) {
                await CompleteOrder(orderId);
            }
        } catch (e) {
            console.error(' Erreur ProcessOrderLine:', e.response?.data || e.message);
        }
    }

    const ImportCommande = async (allClients = []) => {
        if (!file2) return;
        const rows = parseCSV(await readFile(file2));
        setImportedOrders(rows);

        const grouped = rows.reduce((acc, row) => {
            const email = cleanLower(getVal(row, 'client', 'email'));
            if (email && email.includes('@')) {
                if (!acc[email]) acc[email] = [];
                acc[email].push(row);
            }
            return acc;
        }, {});

        for (const email of Object.keys(grouped)) {
            localStorage.removeItem('token_client');
            const clientRows = grouped[email];

            const clientInfo = allClients.find(c => {
                const e = cleanLower(getVal(c, 'email', 'Email', 'mail', 'client'));
                return e === email;
            });

            let pwd = getVal(clientInfo, 'password', 'pwd', 'mdp') || "1234567890";
            if (pwd.length < 6) pwd = pwd.padEnd(6, '0');

            try {
                const loginRes = await api_client.post('/customer/login', {
                    email: email,
                    password: pwd,
                    device_name: 'newapp'
                });
                localStorage.setItem('token_client', loginRes.data.token);

                for (const row of clientRows) {
                    await ProcessOrderLine(row, clientInfo);
                }
            } catch (err) { }
        }
    }


    const ImportData = async () => {
        setLoading(true);
        setMessage('Importation en cours...');
        try {
            if (file1) {
                const rows = parseCSV(await readFile(file1));
                setImportedProducts(rows);

                const uniqueCats = [...new Set(
                    rows.map(r => getVal(r, 'Categorie', 'categorie', 'category', 'cat'))
                        .filter(c => c)
                )];
                setImportedCategories(uniqueCats.map(name => ({ name })));

                for (const cat of uniqueCats) {
                    await InsertCategorie(cat);
                }

                for (const row of rows) {
                    await InsertProduit(row);
                }
            }

            let clients = [];
            if (file3) {
                clients = parseCSV(await readFile(file3));
                setImportedClients(clients);
                for (const row of clients) await InsertClient(row);
            }
            if (file2) await ImportCommande(clients);

            setMessage('Importation terminée avec succès !');
        } catch (error) {
            setMessage("Erreur : " + error.message);
        }
        setLoading(false);
    }


    return (
        <div className="import-container">
            <h1 className="import-title">Importation CSV Robuste</h1>
            {message && <div className={`import-message ${message.includes('Erreur') ? 'error' : 'success'}`}>{message}</div>}
            <div className="import-config">
                <div className="form-group">
                    <label>Séparateur :</label>
                    <select className="form-select" value={separator} onChange={(e) => setSeparator(e.target.value)}>
                        <option value="auto">Auto</option>
                        <option value=",">Virgule (,)</option>
                        <option value=";">Point-virgule (;)</option>
                        <option value={"\t"}>Tabulation</option>
                    </select>
                </div>
                <div className="file-list">
                    <div className="file-row"><label>1. Produits :</label><input type="file" onChange={(e) => setFile1(e.target.files[0])} /></div>
                    <div className="file-row"><label>2. Clients :</label><input type="file" onChange={(e) => setFile3(e.target.files[0])} /></div>
                    <div className="file-row"><label>3. Commandes :</label><input type="file" onChange={(e) => setFile2(e.target.files[0])} /></div>
                </div>
            </div>
            <button className="btn-import" onClick={ImportData} disabled={loading || (!file1 && !file2 && !file3)}>
                {loading ? 'Traitement...' : 'IMPORTER TOUT'}
            </button>
            <ContentImport products={importedProducts} clients={importedClients} orders={importedOrders} categories={importedCategories} />
        </div>
    )
}

export default ImportData

