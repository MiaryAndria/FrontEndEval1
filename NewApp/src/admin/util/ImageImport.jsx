import { useState } from 'react'
import ImageImportService from '../../services/ImageImportService'
import '../css/admin_style.css'

function ImageImport() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [zipFile, setZipFile] = useState(null)
    const [results, setResults] = useState([])
    const [progress, setProgress] = useState(0)

    const importImages = async () => {
        if (!zipFile) return
        setLoading(true)
        setProgress(0)
        setResults([])
        
        await ImageImportService.importImages(zipFile, {
            onMessage: setMessage,
            onProgress: setProgress,
            onLog: (log) => setResults(prev => [...prev, log])
        })

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