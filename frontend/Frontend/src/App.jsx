import { BrowserRouter, Route, Routes } from "react-router"
import { Login } from "./pages/Auth/Login"
import { AuthProvider } from "./auth/AuthContext.jsx"
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard.jsx"
import { EmployeeDashboard } from "./pages/Dashboard/EmployeeDashboard.jsx"
import { ClientDashboard } from "./pages/Dashboard/ClientDashboard.jsx"
import { Home } from "./components/Home.jsx"

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
