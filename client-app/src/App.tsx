import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Start from './pages/Start'
import SignIn from './pages/SignIn'
import Register from './pages/Register'
import Home from './pages/Home'
import SearchList from './pages/SearchList'
import SearchMap from './pages/SearchMap'
import DetailProduct from './pages/DetailProduct'
import ReserveProduct from './pages/ReserveProduct'
import ReserveProductDetailFornProfile from './pages/ReserveProductDetailFornProfile'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import ViewQRCode from './pages/ViewQRCode'

interface PrivateRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/start" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

function App() {
  const { checkAuth } = useAuthStore()

  React.useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      <Route path="/start" element={<Start />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/search/list"
        element={
          <PrivateRoute>
            <SearchList />
          </PrivateRoute>
        }
      />
      <Route
        path="/search/map"
        element={
          <PrivateRoute>
            <SearchMap />
          </PrivateRoute>
        }
      />
      <Route
        path="/product/:id"
        element={
          <PrivateRoute>
            <DetailProduct />
          </PrivateRoute>
        }
      />
      <Route
        path="/reserve/:id"
        element={
          <PrivateRoute>
            <ReserveProduct />
          </PrivateRoute>
        }
      />
      <Route
        path="/reserve/detail/:id"
        element={
          <PrivateRoute>
            <ReserveProductDetailFornProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/qr/:id"
        element={
          <PrivateRoute>
            <ViewQRCode />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App
