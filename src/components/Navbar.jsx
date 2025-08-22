// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-blue-200">
          My Blog
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              <span className="text-blue-200">Welcome, {user.username}!</span>
              <Link 
                to="/create" 
                className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-400 transition-colors"
              >
                Create Post
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-400 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-green-500 px-3 py-1 rounded hover:bg-green-400 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar