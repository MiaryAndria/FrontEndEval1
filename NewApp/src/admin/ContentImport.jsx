function ContentImport({ products, clients, orders, categories }) {
    return (
        <div className="content-import">
            <div className="content-wrapper">
                
                {categories && categories.length > 0 && (
                    <div className="data-section">
                        <h3>Catégories Extraites ({categories.length})</h3>
                        <div className="table-container">
                            <table className="import-table">
                                <thead>
                                    <tr>
                                        <th>Nom de la catégorie</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat, i) => (
                                        <tr key={i}>
                                            <td>{cat.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {products && products.length > 0 && (
                    <div className="data-section">
                        <h3>Produits Importés ({products.length})</h3>
                        <div className="table-container">
                            <table className="import-table">
                                <thead>
                                    <tr>
                                        {Object.keys(products[0]).map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((row, i) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val, j) => (
                                                <td key={j}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {clients && clients.length > 0 && (
                    <div className="data-section">
                        <h3> Clients Importés ({clients.length})</h3>
                        <div className="table-container">
                            <table className="import-table">
                                <thead>
                                    <tr>
                                        {Object.keys(clients[0]).map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((row, i) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val, j) => (
                                                <td key={j}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {orders && orders.length > 0 && (
                    <div className="data-section">
                        <h3> Commandes Importées ({orders.length})</h3>
                        <div className="table-container">
                            <table className="import-table">
                                <thead>
                                    <tr>
                                        {Object.keys(orders[0]).map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((row, i) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val, j) => (
                                                <td key={j}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default ContentImport

