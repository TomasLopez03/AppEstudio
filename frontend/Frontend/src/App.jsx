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
import { HonorarioCarga } from "./components/HonorarioCarga.jsx"
import { HonorariosList } from "./pages/Honorarios/HonorariosList.jsx"
import { ListDocuments } from "./components/ListDocuments.jsx"
import { Profile } from "./components/Profile.jsx"
import { ListEmployee } from "./components/ListEmployee.jsx"
import { PaymentList } from "./pages/Payments/PaymentList.jsx"


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
          < Route path="/honorarios" element={
            <ProtectedRoute allowedRoles={["admin", "employee"]}>
              <HonorarioCarga/>
            </ProtectedRoute>
          }/>
          <Route path="/honorarios/listar" element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'employee']}>
              <HonorariosList/>
            </ProtectedRoute>
          }/>
          <Route path="/documentos" element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'employee']}>
              <ListDocuments/>
            </ProtectedRoute>
          }/>
          <Route path="/perfil" element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'employee']}>
              <Profile />
            </ProtectedRoute>
          }/>
          <Route path="/empleados" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ListEmployee />
            </ProtectedRoute>
          }/>
          <Route path='/pagos' element={
            <ProtectedRoute allowedRoles={['admin', 'employee', 'client']}>
              <PaymentList />
            </ProtectedRoute>
          }/>

          <Route path="/home" element={<Home />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
