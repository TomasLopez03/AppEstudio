import { BrowserRouter, Route, Routes } from "react-router"
import { Login } from "./pages/Auth/Login"
import { AuthProvider } from "./auth/AuthContext.jsx"


function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
