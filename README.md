# 👥 Microservicio REST - Downloads Service  
---
Este proyecto es un microservicio REST diseñado para gestionar descargas de libros y lecturas online. 
---

## 🚀 Características Principales  

- **Gestión de descargas y lecturas en línea:** Proporciona endpoints REST para crear, consultar, actualizar y eliminar registros de descargas y lecturas en línea.  
- **Persistencia:** Utiliza MongoDB como base de datos NoSQL para almacenar información de las descargas y lecturas.  
- **Documentación interactiva:** Incluye integración con Swagger para visualizar y probar los endpoints de manera sencilla.  
- **Autenticación y autorización:** Implementación de autenticación mediante JWT (JSON Web Tokens) para garantizar el acceso seguro a los recursos de la API.  
- **Pruebas:** Preparado para pruebas unitarias e integración para garantizar la calidad del código.  
- **Despliegue:** Diseñado para ser desplegado utilizando contenedores Docker, garantizando portabilidad y escalabilidad.  

---

## 🛠️ Tecnologías y Herramientas Usadas  

- **Node.js:** Plataforma de desarrollo utilizada para implementar el microservicio.  
- **Express.js:** Framework para la creación de APIs REST.  
- **MongoDB:** Base de datos NoSQL para gestionar información de las descargas y lecturas.  
- **Mongoose:** ODM para interactuar con MongoDB.  
- **JWT (JSON Web Tokens):** Herramienta para la autenticación y autorización de usuarios.  
- **Swagger:** Herramienta para la documentación interactiva de la API.  
- **Docker:** Contenedores para empaquetar y desplegar el microservicio.  
- **Jest:** Framework para pruebas unitarias e integración.

---

## 📋 Operaciones Disponibles  

El microservicio expone las siguientes APIs REST para interactuar con los datos de las descargas y lecturas:

### 1. Verificar el estado de salud del servicio  
**Método:** `GET`  
**URL:** `/healthz`  
**Descripción:** Realiza una comprobación del estado de salud del microservicio. Devuelve una respuesta que indica si el servicio está funcionando correctamente.  

**Respuestas:**  
- `200`: El servicio está en funcionamiento.  
- `500`: El servicio no está disponible o presenta problemas.  


## Operaciones de descarga:
### 1. Obtener todas las descargas
**Método:** `GET`  
**URL:** `/downloads`  
**Descripción:** Obtiene una lista de todas las descargas.  

**Respuestas:**  
- `200`: Lista de descargas obtenida exitosamente.  
- `500`: Error en el servidor.  

### 2. Crear una nueva descarga  
**Método:** `POST`  
**URL:** `/downloads`  
**Descripción:** Crea un nuevo registro de descarga.  

**Cuerpo de la solicitud:**  
```json
{
  "usuarioId": "string",
  "libro": "string",
  "formato": "string" 
}
```

### 3. Obtener una descarga por ID  
**Método:** `GET`  
**URL:** `/downloads/{id}`  
**Descripción:** Obtiene los detalles de una descarga específica.  

**Parámetros:**  
- `id`: `string` (path) - ID de la descarga.  

**Respuestas:**  
- `200`: Detalles de la descarga obtenidos exitosamente.  
- `404`: Descarga no encontrada.  
- `500`: Error en el servidor.  

### 4. Eliminar una descarga  
**Método:** `DELETE`  
**URL:** `/downloads/{id}`  
**Descripción:** Elimina un registro de descarga por su ID.  

**Parámetros:**  
- `id`: `string` (path) - ID de la descarga a eliminar.  

**Respuestas:**  
- `200`: Descarga eliminada exitosamente.  
- `404`: Descarga no encontrada.  
- `500`: Error en el servidor.  

### 5. Contar el número de descargas  
**Método:** `GET`  
**URL:** `/downloads/count`  
**Descripción:** Obtiene el número total de descargas registradas.  

**Respuestas:**  
- `200`: Número total de descargas.  
- `500`: Error en el servidor.  

### 6. Contar las descargas de un usuario  
**Método:** `GET`  
**URL:** `/downloads/count/user/{usuarioId}`  
**Descripción:** Obtiene el número total de descargas realizadas por un usuario específico.  

**Parámetros:**  
- `usuarioId`: `string` (path) - ID del usuario.

**Respuestas:**  
- `200`: Número total de descargas del usuario.  
- `404`: Usuario no encontrado.  
- `500`: Error en el servidor.  


## Operaciones de lectura online:
### 1. Obtener todas las lecturas en línea  
**Método:** `GET`  
**URL:** `/api/v1/read-and-download/onlineReadings`  
**Descripción:** Obtiene una lista de todas las lecturas en línea disponibles.  

**Respuestas:**  
- `200`: Lista de lecturas obtenida exitosamente.  
- `500`: Error en el servidor.  


### 2. Obtener una lectura en línea por ID  
**Método:** `GET`  
**URL:** `/api/v1/read-and-download/onlineReadings/{id}`  
**Descripción:** Obtiene los detalles de una lectura en línea específica.  

**Parámetros:**  
- `id`: `string` (path) - ID de la lectura en línea.  

**Respuestas:**  
- `200`: Detalles de la lectura obtenidos exitosamente.  
- `404`: Lectura no encontrada.  
- `500`: Error en el servidor.  


### 3. Crear una nueva lectura en línea  
**Método:** `POST`  
**URL:** `/api/v1/read-and-download/onlineReadings`  
**Descripción:** Crea un nuevo registro de lectura en línea.  

**Cuerpo de la solicitud:**  
```json
{
  "usuarioId": "string",
  "titulo": "string",
  "autor": "string",
  "formato": "string",  // Opcional: valores posibles "PDF", "EPUB", "MOBI" (default: "PDF")
  "idioma": "string",   // Opcional: valores permitidos "es", "en"
  "isbn": "string"      // Opcional
}
```

### 4. Eliminar una lectura en línea
**Método:** `DELETE`  
**URL:** `/onlinereadings/{id}`  
**Descripción:** Elimina un registro de lectura en línea por su ID.  

**Parámetros:**  
- `id`: `string` (path) - ID de la lectura en línea a eliminar.  

**Respuestas:**  
- `200`: Lectura en línea eliminada exitosamente.  
- `404`: Lectura en línea no encontrada.  
- `500`: Error en el servidor.  


## 📦 Estructura del Proyecto

- **`authentication/`:** contiene la lógica de autenticación utilizando JWT (JSON Web Tokens) para asegurar el acceso a los endpoints de la API. Este módulo genera y valida tokens de acceso para garantizar la seguridad de las operaciones.  
- **`bin/`:** contiene la configuración para iniciar el servidor, como el archivo `www`. 
- **`models/`:** define los esquemas de los datos utilizados en MongoDB. Aquí se encuentra el modelo `downloads.js`, que define la estructura de los documentos de descarga y las validaciones necesarias para los campos como `usuarioId`, `libro`, y `formato`.  De la misma forma, hay un modelo `onlineReadings.js` para las lecturas online.
- **`routes/`:** maneja las rutas de la API REST.  
  - **`downloads.js`:** define las rutas específicas relacionadas con las descargas, incluyendo las operaciones de obtener, crear, actualizar y eliminar descargas.  
  - **`onlinereadings.js`:** define las rutas específicas relacionadas con las lecturas en línea.  
- **`tests/`:** directorio que contiene pruebas automatizadas utilizando Jest. Se organiza en módulos para asegurar la calidad del código, con archivos de prueba para los endpoints de descargas (`component-downloads.test.js`) y lecturas online (`component-onlineReadings.test.js`).  
- **`app.js`:** archivo principal que configura la aplicación Express. Aquí se inicializan los middlewares y las rutas de la API. También maneja la configuración de Swagger para la documentación interactiva de la API.  
- **`Dockerfile`:** contiene las instrucciones para crear y ejecutar el contenedor Docker. En este archivo se configura la instalación de dependencias, la copia de archivos y la exposición del puerto necesario para la aplicación.  
- **`package.json`:** Especifica las dependencias del proyecto, los scripts de ejecución (como `npm start`), y los detalles del proyecto. 

---

## 🔐 Seguridad

- **JWT (JSON Web Tokens):**  
  - Autenticación de usuarios mediante la generación de tokens firmados. Los usuarios deben enviar un token válido en el encabezado `Authorization` para acceder a los endpoints protegidos.  
  - Validación del token en cada solicitud para garantizar la seguridad de las operaciones. Si el token es inválido o ha expirado, se denegará el acceso.  
- **Validación de datos.** El modelo de descargas aplica restricciones como tipos de datos y valores válidos (`enum` para el campo `formato`, que puede ser "PDF", "EPUB"). Además, se implementan validaciones para asegurar que los datos enviados sean correctos antes de ser procesados.  
- **Errores gestionados.** Todos los endpoints manejan errores comunes como datos no encontrados (por ejemplo, si no se encuentra una descarga por su ID) o problemas en el servidor. Los errores son capturados y se responden con mensajes adecuados y códigos de estado HTTP (por ejemplo, `404` para no encontrado, `500` para error en el servidor).
