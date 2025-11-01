import { BrowserRouter, Route, Routes } from "react-router"
import { Toaster } from "react-hot-toast"
import { Login } from "./pages/Auth/Login"
import { AuthProvider, AuthContext } from "./auth/AuthContext.jsx"
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard.jsx"
import { EmployeeDashboard } from "./pages/Dashboard/EmployeeDashboard.jsx"
import { ClientDashboard } from "./pages/Dashboard/ClientDashboard.jsx"
import { Home } from "./components/Home.jsx"
import Operacion from "./components/Operacion.jsx"
import { ListClient } from "./components/ListClient.jsx"
import { ProtectedRoute } from "./components/ProtectedRoute.jsx"
import { useContext } from "react"


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/operaciones" element={
            <ProtectedRoute allowedRoles={["admin","employee"]}>
              <Operacion />
            </ProtectedRoute>
          } />
          <Route path="/clientes" element={
            <ProtectedRoute allowedRoles={["admin","employee"]}>
              <ListClient />
            </ProtectedRoute>
          } />
          <Route path="/home" element={<Home />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
