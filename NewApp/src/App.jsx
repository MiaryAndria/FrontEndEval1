import { Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'
import DetailProduit from './client/categories/DetailProduit'
import Login from './client/Login/Login'
import ProduitCategorie from './client/categories/Produit'
import ListCategorie from './client/categories/List'
import Panier from './client/Panier/Content'
import ValiderCommande from './client/Panier/ValiderCommande'
import ListeCommande from './client/Panier/ListeCommande'
import LoginAdmin from './admin/login/Login'
import CommandeAdmin from './admin/commandes/List'
import Wishlist from './client/Wishlist/List'
import Acceuil from './admin/Acceuil'
import ImportData from './admin/util/Import'
import ImageImport from './admin/util/ImageImport'
import ListProduit from './admin/stock/ListeProduit'
import AjouterStock from './admin/stock/Insert'
import InfoProduit from './admin/stock/InfoProduit'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/admin/stock/info/:id" element={<InfoProduit/>}/>
          <Route path="/image/import" element={<ImageImport/>}/>
          <Route path="/admin/stock/list" element={<ListProduit/>}/>
          <Route path="/admin/stock/add/:id" element={<AjouterStock/>}/>
          <Route path="/import" element={<ImportData/>}/>
          <Route path="/acceuil/admin" element={<Acceuil/>}/>
          <Route path="/" element={<Login />} />
          <Route path="/WishList" element={<Wishlist />} />
          <Route path="/admin" element={<LoginAdmin />} />
          <Route path="/admin/commandes" element={<CommandeAdmin />} />
          <Route path="/commande" element={<ListeCommande/>}/>
          <Route path="/checkout" element={<ValiderCommande/>}/>
          <Route path="/Panier" element={<Panier/>} />
          <Route path="/client/login" element={<Login />} />
          <Route path="/client/produit/:id" element={<DetailProduit />} />
          <Route path="/client/categorie/:id/produit" element={<ProduitCategorie />} />
          <Route path="/client/categorie/list" element={<ListCategorie />} />
        </Routes>
      </main>
    </div>
  )
}

export default App



