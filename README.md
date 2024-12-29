# 👥 Microservicio REST - Downloads Service  

Este proyecto es un microservicio REST diseñado para gestionar descargas de libros. Implementa una arquitectura orientada a microservicios utilizando tecnologías modernas y escalables.  

---

## 🚀 Características Principales  

- **Gestión de descargas:** Proporciona endpoints REST para crear, consultar, actualizar y eliminar registros de descargas.  
- **Persistencia:** Utiliza MongoDB como base de datos NoSQL para almacenar información de las descargas.  
- **Documentación interactiva:** Incluye integración con Swagger para visualizar y probar los endpoints de manera sencilla.  
- **Pruebas:** Preparado para pruebas unitarias e integración para garantizar la calidad del código.  
- **Despliegue:** Diseñado para ser desplegado utilizando contenedores Docker, garantizando portabilidad y escalabilidad.  

---

## 🛠️ Tecnologías y Herramientas Usadas  

- **Node.js:** Plataforma de desarrollo utilizada para implementar el microservicio.  
- **Express.js:** Framework para la creación de APIs REST.  
- **Swagger:** Herramienta para la documentación interactiva de la API.  
- **Docker:** Contenedores para empaquetar y desplegar el microservicio.  
- **MongoDB:** Base de datos NoSQL para gestionar información de descargas.  
- **Jest**: Framework para pruebas unitarias e integración.
- **JWT (JSON Web Tokens):** Herramienta para la autenticación y autorización de usuarios.  

---

## 📋 Operaciones Disponibles  

El microservicio expone las siguientes APIs REST para interactuar con los datos de las descargas:  

### 1. Obtener todas las descargas  
**Método:** `GET`  
**URL:** `/downloads`  
**Descripción:** Obtiene una lista de todas las descargas.  

**Respuestas:**  
- `200`: Lista de descargas obtenida exitosamente.  
- `500`: Error en el servidor.  

---

### 2. Obtener una descarga por ID  
**Método:** `GET`  
**URL:** `/downloads/{id}`  
**Descripción:** Obtiene los detalles de una descarga específica.  

**Parámetros:**  
- `id`: `string` (path) - ID de la descarga.  

**Respuestas:**  
- `200`: Detalles de la descarga obtenidos exitosamente.  
- `404`: Descarga no encontrada.  
- `500`: Error en el servidor.  

---

### 3. Crear una nueva descarga  
**Método:** `POST`  
**URL:** `/downloads`  
**Descripción:** Crea un nuevo registro de descarga.  

**Cuerpo de la solicitud:**  
```json
{
  "usuarioId": "string",
  "libro": "string",
  "formato": "string" // Opcional: valores posibles "PDF", "EPUB", "MOBI" (default: "PDF")
}
```
**Respuestas:**
- `200`: Descarga actualizada exitosamente.  
- `404`: Descarga no encontrada.  
- `500`: Error en el servidor. 


---
### 4. Actualizar una descarga  
**Método:** `PUT`  
**URL:** `/downloads/{id}`  
**Descripción:** Actualiza los datos de una descarga existente. 
**Parámetros:** id: string (path) - ID de la descarga a actualizar.

**Cuerpo de la solicitud:**  
```json
{
  "usuarioId": "string", // Opcional
  "libro": "string", // Opcional
  "formato": "string" // Opcional: valores posibles "PDF", "EPUB", "MOBI"
}

```

**Respuestas:**
- `200`: Descarga actualizada exitosamente.  
- `404`: Descarga no encontrada.  
- `500`: Error en el servidor. 

### 5. Eliminar una descarga  
**Método:** `DELETE`  
**URL:** `/downloads/{id}`  
**Descripción:** Elimina un registro de descarga por su ID.  

**Parámetros:**  
- `id`: `string` (path) - ID de la descarga a eliminar.  

**Respuestas:**  
- `200`: Descarga eliminada exitosamente.  
- `404`: Descarga no encontrada.  
- `500`: Error en el servidor.  

---

## 📦 Estructura del Proyecto  

- **`bin/`:** Contiene la configuración para iniciar el servidor, como el archivo `www`.  
- **`database/`:** Incluye los detalles para conectarse a la base de datos MongoDB Atlas.  
- **`models/`:** Define los esquemas de los datos utilizados en MongoDB, como el modelo `downloads.js`.  
- **`routes/`:** Maneja las rutas de la API REST, incluyendo rutas base (`index.js`) y específicas de descargas (`downloads.js`).  
- **`authentication/`:** Contiene la lógica de autenticación y la configuración de JWT para gestionar accesos seguros.  
- **`tests/`:** Directorio de pruebas automatizadas con Jest, organizadas por módulos (`downloads.test.js` y `auth.test.js`).  
- **`public/`:** Carpeta para archivos estáticos como imágenes, CSS y JavaScript accesibles desde el navegador.  
- **`app.js`:** Archivo principal que configura la aplicación Express, conecta rutas y middleware.  
- **`Dockerfile`:** Contiene las instrucciones para crear y ejecutar el contenedor Docker.  
- **`package.json`:** Especifica las dependencias del proyecto y scripts de ejecución.  

---

## 🔐 Seguridad  

- **JWT (JSON Web Tokens):**  
  - Autenticación de usuarios mediante la generación de tokens firmados.  
  - Validación del token en cada solicitud para garantizar la seguridad de las operaciones.  
- **Validación de datos:** El modelo de descargas aplica restricciones como tipos de datos y valores válidos (`enum`).  
- **Errores gestionados:** Todos los endpoints manejan errores comunes como datos no encontrados o problemas en el servidor.  
