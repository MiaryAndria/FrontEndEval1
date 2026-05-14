import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, ListOrdered, Home, LogOut, Upload, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import api_client from './api/api_client'
import api_admin from './api/api_admin'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [adminOrderCount, setAdminOrderCount] = useState(0)

  const isAdmin = location.pathname.includes('/admin') || location.pathname === '/import' || location.pathname === '/image/import'
  const isAuthPage = location.pathname === '/' || location.pathname === '/admin' || location.pathname === '/client/login'

  const fetchCounts = async () => {
    if (isAuthPage) return

    if (isAdmin) {
      try {
        const res = await api_admin.get('/admin/sales/orders').catch(() => ({ data: { data: [] } }))
        setAdminOrderCount(res.data?.data?.length || 0)
      } catch (e) { console.error("Admin counts error:", e) }
    } else {
      try {
        const [cartRes, wishRes, orderRes] = await Promise.all([
          api_client.get('/customer/cart').catch(() => ({ data: { data: null } })),
          api_client.get('/customer/wishlist').catch(() => ({ data: { data: [] } })),
          api_client.get('/customer/orders').catch(() => ({ data: { data: [] } }))
        ])

        if (cartRes.data?.data?.items) {
          setCartCount(cartRes.data.data.items.length)
        } else {
          setCartCount(0)
        }

        if (wishRes.data?.data) {
          setWishlistCount(wishRes.data.data.length)
        } else {
          setWishlistCount(0)
        }

        if (orderRes.data?.data) {
          setOrderCount(orderRes.data.data.length)
        } else {
          setOrderCount(0)
        }
      } catch (error) {
        console.error("Client counts error:", error)
      }
    }
  }

  useEffect(() => {
    fetchCounts()

    const handleUpdate = () => fetchCounts()
    window.addEventListener('cart-updated', handleUpdate)
    window.addEventListener('wishlist-updated', handleUpdate)
    window.addEventListener('orders-updated', handleUpdate)

    return () => {
      window.removeEventListener('cart-updated', handleUpdate)
      window.removeEventListener('wishlist-updated', handleUpdate)
      window.removeEventListener('orders-updated', handleUpdate)
    }
  }, [location.pathname, isAdmin, isAuthPage])


  if (isAuthPage) return null

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('token_admin')
      navigate('/admin')
    } else {
      localStorage.removeItem('token_client')
      navigate('/')
    }
  }

  return (
    <nav className="navbar">
      <Link to={isAdmin ? "/acceuil/admin" : "/client/categorie/list"} className="navbar-brand">
        <Package size={24} color="var(--primary-color)" />
        {isAdmin ? "ADMIN_3530" : "BOUTIQUE_3530"}
      </Link>

      <div className="navbar-nav">
        {isAdmin ? (
          <>
            <Link to="/acceuil/admin" className="nav-link">
              <Home size={18} /> Accueil
            </Link>
            <Link to="/import" className="nav-link">
              <Upload size={18} /> Imports
            </Link>
            <Link to="/admin/commandes" className="nav-link">
              <div style={{ position: 'relative' }}>
                <ListOrdered size={18} />
                {adminOrderCount > 0 && <span className="badge">{adminOrderCount}</span>}
              </div>
              Commandes
            </Link>
          </>
        ) : (
          <>
            <Link to="/client/categorie/list" className="nav-link">
              <Home size={18} /> Accueil
            </Link>
            <Link to="/WishList" className="nav-link">
              <div style={{ position: 'relative' }}>
                <Heart size={18} />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </div>
              Favoris
            </Link>
            <Link to="/commande" className="nav-link">
              <div style={{ position: 'relative' }}>
                <ListOrdered size={18} />
                {orderCount > 0 && <span className="badge">{orderCount}</span>}
              </div>
              Commandes
            </Link>
            <Link to="/Panier" className="nav-link">
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={18} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </div>
              Panier
            </Link>
          </>
        )}

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>

        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </nav>
  )
}

export default Navbar
