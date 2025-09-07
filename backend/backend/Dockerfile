#imagen base con python 3.11
FROM python:3.11-slim

#establecemos el directorio de trabajo
WORKDIR /app

#instalamos las dependencias 
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev gcc pkg-config\
    && rm -rf /var/lib/apt/lists/*

#copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#copiamos el codigo de la aplicacion
COPY . .

#exponemos el puerto 8000
EXPOSE 8000

#comando para correr el servidor
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]

