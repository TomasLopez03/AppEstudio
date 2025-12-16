import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronLeft, LogOut, Home, Users, Settings, User, BookText, Folder, Banknote } from 'lucide-react';

const closeSession = () => {
  // Aquí puedes agregar la lógica para cerrar sesión, como limpiar el estado de autenticación, redirigir, etc.
  localStorage.clear();
  window.location.href = '/login'; // Redirige al usuario a la página de login

}

// Define los enlaces para diferentes roles
const getNavLinks = (role) => {
  const baseLinks = [
    { name: 'Inicio', href: '/home', icon: Home },
    { name: 'Mi Perfil', href: '/perfil', icon: User },
    { name: 'Pagos', href: '/pagos', icon: Banknote },
  ];

  if (role === 'admin') {
    return [
      ...baseLinks,
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Empleados', href: '/empleados', icon: Users },
      { name: 'Operaciones', href: '/operaciones', icon: Settings },
      {
        name: 'Honorarios', isDropdown: true, icon: Folder,
        sublinks: [
          { name: 'Cargar Honorarios', href: '/honorarios' },
          { name: 'Listar Honorarios', href: '/honorarios/listar' },
        ]
      },
    ];
  }
  if (role === 'employee') {
    return [
      ...baseLinks,
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Operaciones', href: '/operaciones', icon: Settings },
      {
        name: 'Honorarios', isDropdown: true, icon: Folder,
        sublinks: [
          { name: 'Cargar Honorarios', href: '/honorarios' },
          { name: 'Listar Honorarios', href: '/honorarios/listar' },
        ]
      },
    ]
  }
  // Enlaces para el rol 'Client' o cualquier otro rol por defecto
  return [
    ...baseLinks,
    { name: 'Honorarios', href: '/honorarios/listar', icon: Folder },
    { name: 'Mis Documentos', href: '/documentos', icon: BookText },
  ];
};

export const Navbar = ({ userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para controlar qué dropdown está abierto en la vista de escritorio/móvil
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navLinks = getNavLinks(userRole);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null); // También cerramos cualquier dropdown abierto
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };
  // Clase dinámica para el sidebar móvil
  const mobileMenuClass = isMenuOpen
    ? 'translate-x-0'
    : '-translate-x-full';

  return (
    <header className="w-full bg-white shadow-md">
      {/* Contenedor Principal de la Barra de Navegación */}
      <div className="flex items-center justify-between max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 ">

        {/* Lado Izquierdo: Toggle y Título de la Página */}
        <div className="flex items-center space-x-4">
          {/* Botón de Toggle del Menú (Visible solo en Mobile) */}
          <button
            className="text-gray-800 p-2 rounded-lg hover:bg-gray-200 transition-colors md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>

          {/* Título de la Aplicación/Página */}
          <h1 className="text-xl font-bold text-orange-600 hidden sm:block">
            {/* Aquí puedes poner el logo o el nombre de tu Estudio Contable */}
            Estudio Geria Reines
          </h1>
        </div>

        {/* Lado Derecho: Navbar de Escritorio (Visible solo en Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            // Dropdown items
            if (link.isDropdown) {
              return (
                <div key={link.name} className="relative group">
                  <button className="text-gray-700 font-medium hover:text-orange-600 transition-colors flex items-center space-x-2">
                    <link.icon size={18} />
                    <span>{link.name}</span>
                  </button>
                  {/* Dropdown menu */}
                  <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {link.sublinks.map((sublink) => (
                      <Link
                        key={sublink.name}
                        to={sublink.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            // Regular links
            if (link.href && link.href.startsWith('/')) {
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-700 font-medium hover:text-orange-600 transition-colors flex items-center space-x-2"
                >
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            }
            return (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 font-medium hover:text-orange-600 transition-colors flex items-center space-x-2"
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </a>
            );
          })}

          {/* Botón de Cerrar Sesión en Desktop */}
          <button
            className="text-red-600 font-medium hover:text-red-800 transition-colors flex items-center space-x-2"
            onClick={() => closeSession()}
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </div>

      {/* --- Sidebar Desplegable (Mobile) --- */}

      {/* Fondo Oscurecido/Overlay (Click para cerrar) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden backdrop-blur-xs"
          onClick={closeMenu}
        ></div>
      )}

      {/* Menú Móvil - Se despliega desde la izquierda y ocupa 3/4 del ancho */}
      <div
        className={`fixed top-0 left-0 w-3/4 h-full bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out ${mobileMenuClass} md:hidden`}
        aria-hidden={!isMenuOpen}
      >
        <div className="p-6 h-full flex flex-col justify-between">

          {/* Parte Superior: Botón de Cierre y Enlaces */}
          <div>
            {/* Botón de Cerrar/Flecha hacia atrás */}
            <button
              className="text-gray-800 p-2 mb-8 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={closeMenu}
              aria-label="Cerrar Menú"
            >
              <ChevronLeft size={28} />
            </button>

            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 border-b pb-2">
              Navegación - {userRole}
            </h3>

            <nav className="flex flex-col space-y-2 text-base font-medium">
              {navLinks.map((link) => {
                // Dropdown items
                if (link.isDropdown) {
                  const isOpen = activeDropdown === link.name;
                  return (
                    <div key={link.name}>
                      <button
                        onClick={() => toggleDropdown(link.name)}
                        className="w-full text-gray-700 hover:text-orange-600 p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3 justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <link.icon size={20} className="text-orange-500" />
                          <span>{link.name}</span>
                        </div>
                        <ChevronLeft 
                          size={18} 
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {/* Submenu */}
                      {isOpen && (
                        <div className="ml-4 flex flex-col space-y-1 mt-1">
                          {link.sublinks.map((sublink) => (
                            <Link
                              key={sublink.name}
                              to={sublink.href}
                              onClick={closeMenu}
                              className="text-gray-600 hover:text-orange-600 p-2 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                            >
                              {sublink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                // Regular links
                if (link.href && link.href.startsWith('/')) {
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={closeMenu}
                      className="text-gray-700 hover:text-orange-600 p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    >
                      <link.icon size={20} className="text-orange-500" />
                      <span>{link.name}</span>
                    </Link>
                  );
                }
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="text-gray-700 hover:text-orange-600 p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                  >
                    <link.icon size={20} className="text-orange-500" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Parte Inferior: Cerrar Sesión */}
          <button
            className="text-red-600 font-semibold p-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center space-x-3"
            onClick={() => closeSession()}
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar;
