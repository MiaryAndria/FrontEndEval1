import { useNavigate } from 'react-router-dom'
import './css/admin_style.css'
import DeleteAll from './Delete'
import ImportData from './Import'

function Acceuil() {
    const navigate = useNavigate()

    return (
        <div className="admin-container">

            {/* Actions principales */}
            <div className="admin-header">
                <h1>Tableau de bord Admin</h1>
                <p>Bienvenue dans votre espace d'administration</p>
            </div>

            <div className="admin-actions">
                <ImportData />
                <DeleteAll />

                <button className="btn btn-primary mt-20" onClick={() => navigate('/admin/commandes')}>Accéder aux commandes</button>
            </div>

        </div>
    )
}

export default Acceuil