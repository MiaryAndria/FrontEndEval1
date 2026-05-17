function ContentImport({ products, clients, orders, categories }) {
    if (!products?.length && !clients?.length && !orders?.length && !categories?.length) return null;

    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.875rem' };
    const thStyle = { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600' };
    const tdStyle = { padding: '0.75rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            
            {categories && categories.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Catégories Extraites ({categories.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Nom de la catégorie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat, i) => (
                                    <tr key={i}>
                                        <td style={tdStyle}>{cat.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {products && products.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Produits Importés ({products.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    {Object.keys(products[0]).map((header, index) => (
                                        <th key={index} style={thStyle}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={tdStyle}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {clients && clients.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Clients Importés ({clients.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    {Object.keys(clients[0]).map((header, index) => (
                                        <th key={index} style={thStyle}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={tdStyle}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {orders && orders.length > 0 && (
                <div className="card">
                    <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Commandes Importées ({orders.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    {Object.keys(orders[0]).map((header, index) => (
                                        <th key={index} style={thStyle}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={tdStyle}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ContentImport

