# AppEstudio
  App Web para Estudio Contable

--------------------------------------------

# Obtener el repositorio
Para hacer copia local del repositorio, ejecutar lo siguiente:
```
  git clone https://github.com/TomasLopez03/AppEstudio.git
```
Ya hecha la copia puede comenzar a tabajar 

-----------------------------------------------

# Configuración y Ejecucion del Backend (usando Docker)
Este proyecto utiliza Docker y Docker Compose para crear un entorno de ejecución consistente que incluye la aplicación web (Django) y la base de datos (MySQL).

### 📝Prerrequisitos
1. **Docker:** La plataforma de contenedores
2. **Docker Compose:** Heramienta para definir y ejecutar aplicaciones docker

### ⚙Pasos de Configuración
**1. Crear el archivo (.env)**
Ya clonado el repositorio, entra a la raiz del backend, donde se encuentra el `docker-compose.yml` el cual contiene
la configuracion de la base de datos y obtiene los datos de configuracion el archivo `.env`.
ejecuta lo siguiente dentro del repositorio:
  ```
  cd backend/backend
  ```
  Para configurar tu archivo `.env` duplica `.env.example` y renombralo `.env`:
  ```
  cp .env.example .env
  ```
  Luego, edita el nuevo archivo `.env` y reemplaza los valores con tus credenciales

**2. Levantar los Contenedores con Docker Compose**
Una vez tengas el archivo `.env` configurado, puedes contruir las imagenes y levantar los contenedores
(app y base de datos) con un solo comando:
```
docker-compose up -d --build
```
* `up`: Crea y levanta los contenedores
* `-d`: Ejecuta los contenedores en segundo plano
* `--build`: Fuera a Docker a reconstruir la imagen de la aplicacion web (web) usando el `Dockerfile` ante de iniciar 

**3. Ejecutar las migraciones de la base de datos**
Despues de que los contenedores esten corriendo por primera vez, necesitas aplicar las migraciones de django para
crear las tablas en la base de datos MySQL.
Ejecuta el siguiente comando para correr el comando makemigrations y migrate dentro del contenedor de la aplicación web:
```
docker-compose exec web python manage.py makemigrations 
docker-compose exec web python manage.py migrate
```

**4. Acceder a la Aplicacion**
Tu backend ya debería estar corriendo. Por defecto, estará disponible en el puerto 8000 de tu máquina local,
ya que así está configurado en `docker-compose.yml` (`"8000:8000"`).
* URL de Acceso: `http://localhost:8000/`

# Configuracion del Frontend (React + Vite)

### Prerrequisitos 
1. **Node.js y npm/yarn:** necesarios para instalar y ejecutar React

### Pasos de Configuracion
**1. Navegar a la raiz del Frontend**
Vuelve a la raiz del protafolio usando el siguiente comando las veces necesarias: 
``` cd .. ```
Luego: 
```
cd frontend/frontend
```

**2. Instalar dependencias**
Instala todas las dependencias del proyecto definidas en el `package.json`:
```
npm install
```

**3. Configuracion de la URL**
Para que la aplicación React se conecte a tu backend, debes configurar una variable de entorno que apunte a la dirección donde se expone la API de Django.
Crea un archivo llamado `.env` en la raíz de tu proyecto frontend.
En este archivo, define la variable de entorno para el backend. Dado que estás ejecutando el backend a través de Docker Compose, que mapea el puerto 8000 al host local, la URL será:
```
VITE_API_URL = 'http://localhost:8000'
```

**4. Ejecutar la aplicacion** 
Inicia la aplicación de desarrollo de Vite:
```
npm run dev
```
La aplicación React se iniciará (usualmente en http://localhost:5173/ o similar) y ahora podrá comunicarse con tu backend de Django que está corriendo en http://localhost:8000.

----------------------------------------------

# Pull requests
Para trabajar se deben seguir los siguientes pasos

1. Debe asegurarse de estar actualizado
```
  git checkout main
  git pull origin main
```
2. Debe crear una rama nueva para su feature
```
  git checkout -b feature/<nombre-de-la-rama>
```
3. Realiza los cambios, commits y los sube
```
  git add .
  git commit -m '<commit>'
  git push origin feature/<nombre-de-la-rama>
```
4. Por ultimo crear el pull requests hacia main





