import React, { useState } from 'react';
import ImportService from '../../services/ImportService';
import ContentImport from './ContentImport';
import '../css/admin_style.css'

const ImportData = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [separator, setSeparator] = useState('auto');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');

    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [file3, setFile3] = useState(null);

    const [importedProducts, setImportedProducts] = useState([]);
    const [importedClients, setImportedClients] = useState([]);
    const [importedOrders, setImportedOrders] = useState([]);
    const [importedCategories, setImportedCategories] = useState([]);

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
        });
    };

    const startImport = async () => {
        setLoading(true);
        setCurrentStep('Lecture des fichiers...');
        setMessage('');
        ImportService.reset();
        
        try {
            let rows1 = [], rows2 = [], rows3 = [];

            if (file1) {
                const content = await readFile(file1);
                rows1 = ImportService.parseCSV(content, separator);
            }
            if (file3) {
                const content = await readFile(file3);
                rows3 = ImportService.parseCSV(content, separator);
            }
            if (file2) {
                const content = await readFile(file2);
                rows2 = ImportService.parseCSV(content, separator);
            }

            const totalRows = rows1.length + rows2.length + rows3.length;
            let processedRows = 0;
            const progressTracker = {
                increment: () => {
                    processedRows++;
                    setProgress(Math.round((processedRows / totalRows) * 100));
                }
            };

            if (file1 && rows1.length > 0) {
                setCurrentStep('Importation des produits...');
                setImportedProducts(rows1);
                
                const uniqueCats = [...new Set(rows1.map(r => ImportService.getVal(r, 'Categorie', 'categorie', 'category', 'cat')).filter(c => c))];
                setImportedCategories(uniqueCats.map(name => ({ name })));

                for (const row of rows1) {
                    const catId = await ImportService.insertCategorie(row);
                    await ImportService.insertProduit(row, catId);
                    progressTracker.increment();
                }
            }

            if (file3 && rows3.length > 0) {
                setCurrentStep('Importation des clients...');
                setImportedClients(rows3);
                for (const row of rows3) {
                    await ImportService.insertClient(row);
                    progressTracker.increment();
                }
            }

            if (file2 && rows2.length > 0) {
                setCurrentStep('Importation des commandes...');
                setImportedOrders(rows2);
                await ImportService.importCommandes(rows2, rows3, progressTracker);
            }

            setCurrentStep('');
            setMessage('Importation terminée avec succès !');
        } catch (error) {
            console.error(error);
            setCurrentStep('');
            let errorMsg = error.message;
            if (errorMsg.includes('colonne')) errorMsg = "Le fichier contient des noms de colonnes invalides ou des caractères spéciaux non autorisés.";
            else if (errorMsg.includes('date')) errorMsg = "Le format de la date doit être JJ/MM/AAAA.";
            else if (errorMsg.includes('negatif')) errorMsg = "Les montants négatifs sont interdits.";
            
            setMessage('Erreur d\'importation : ' + errorMsg);
        }

        setLoading(false);
        setProgress(0);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1>Import CSV</h1>
                <p style={{ color: 'var(--text-muted)' }}>Mettez en ligne vos fichiers CSV pour importer produits, clients et commandes.</p>
            </div>

            {message && (
                <div
                    className={`alert ${message.includes('Erreur') ? 'alert-error' : ''}`}
                    style={{
                        backgroundColor: message.includes('Erreur') ? '' : '#ecfdf5',
                        color: message.includes('Erreur') ? '' : '#059669',
                        border: message.includes('Erreur') ? '' : '1px solid #a7f3d0',
                    }}
                >
                    {message}
                </div>
            )}

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                    <label>Séparateur CSV</label>
                    <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="input-field">
                        <option value="auto">Auto</option>
                        <option value=",">Virgule (,)</option>
                        <option value=";">Point-virgule (;)</option>
                        <option value={'\t'}>Tabulation</option>
                    </select>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />

                <div className="form-group">
                    <label>1. Produits & Catégories (CSV)</label>
                    <input type="file" accept=".csv" onChange={(e) => setFile1(e.target.files[0])} className="input-field" />
                </div>

                <div className="form-group">
                    <label>2. Clients (CSV)</label>
                    <input type="file" accept=".csv" onChange={(e) => setFile3(e.target.files[0])} className="input-field" />
                </div>

                <div className="form-group">
                    <label>3. Commandes (CSV)</label>
                    <input type="file" accept=".csv" onChange={(e) => setFile2(e.target.files[0])} className="input-field" />
                </div>

                {loading && currentStep && (
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            Étape en cours : {currentStep} {progress > 0 && `(${progress}%)`}
                        </p>
                        {progress > 0 && (
                            <div style={{ backgroundColor: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, backgroundColor: 'var(--primary-color)', height: '100%', transition: 'width 0.3s ease' }} />
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    onClick={startImport}
                    disabled={loading || (!file1 && !file2 && !file3)}
                    style={{
                        width: '100%', marginTop: '1rem',
                        opacity: (loading || (!file1 && !file2 && !file3)) ? 0.7 : 1,
                        cursor: (loading || (!file1 && !file2 && !file3)) ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? `Traitement en cours... ${progress}%` : "LANCER L'IMPORTATION"}
                </button>
            </div>

            <ContentImport
                products={importedProducts}
                clients={importedClients}
                orders={importedOrders}
                categories={importedCategories}
            />
        </div>
    );
};

export default ImportData;