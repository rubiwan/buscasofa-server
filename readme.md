Creación de la tabla de usuarios en mySQL (para despliegue)

```sql
CREATE DATABASE IF NOT EXISTS gasolineras;
USE gasolineras;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Para instalar las dependencias: 

```
npm install
```

Para lanzar el servidor de desarrollo:

```
npm run dev
```

o 

```
node index_dev.js
```