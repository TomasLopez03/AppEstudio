import logoEmpresa from '../assets/images/logoEmpresa.jpeg';


export const Home = () => {
    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8">
                <div className="w-full max-w-4xl text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent mt-12 bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-8 tracking-tight">
                        ¡Bienvenido!
                    </h1>
                    <div className="w-full px-4 sm:px-10 lg:px-42 mb-12">
                        <img
                            src={logoEmpresa}
                            alt="Logo de la empresa - Estudio Contable Geria Reines 35 años de trayectoria"
                            className="w-full h-auto rounded-xl shadow-2xl transition-transform hover:scale-[1.01] duration-300 border-4 border-white mx-auto"
                            // Manejo de error si la URL no funciona
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/800x200/808080/FFFFFF?text=Error+al+cargar+la+imagen";
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
