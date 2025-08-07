📂 DICRI Evidence System
Sistema de Gestión de Evidencias DICRI — compuesto por Backend (gestión de base de datos y API REST) y Frontend (interfaz web para gestión de expedientes e indicios).

📦 Estructura del Proyecto
bash
Copiar
Editar
DICRI-EVIDENCE-SYSTEM/
│
├── backend/     # API REST + conexión a SQL Server
├── frontend/    # Interfaz web (React + Tailwind)
└── README.md    # Este archivo

🚀 Requisitos Previos
Docker y Docker Compose instalados

Node.js 18+ (si se quiere correr local sin Docker)

SQL Server 2022+ (si se quiere correr local sin Docker)

⚙️ Levantar el sistema con Docker
1️⃣ Levantar Backend + Base de Datos
Ir a la carpeta backend y ejecutar:


cd backend
docker compose up -d --build

NOTA: Para fines de la prueba se subio el archivo .env a github, 
pero una buena practica es no subirlo

Esto iniciará:

SQL Server en el puerto 1433

Backend API en el puerto 3001

📄 Documentación Swagger:
http://localhost:3001/api-docs

2️⃣ Levantar Frontend
Ir a la carpeta frontend y ejecutar:


cd ../frontend
docker compose up -d --build
Esto iniciará:

Frontend en el puerto 8080 (o el que definas en docker-compose)

🌐 Acceso web:
http://localhost:8080

🔑 Usuarios de prueba
Usuario	Contraseña	Rol
admin	123456	coordinador
juan.perez	123456	técnico
maria.garcia	123456	técnico
carlos.lopez	123456	coordinador

📊 Endpoints principales (Backend)
Autenticación
POST /api/auth/login — Iniciar sesión

GET /api/auth/profile — Perfil del usuario

Expedientes
GET /api/expedientes — Listar expedientes

POST /api/expedientes — Crear expediente

PUT /api/expedientes/:id/aprobar — Aprobar (solo coordinador)

Indicios
GET /api/indicios/expediente/:id — Indicios de un expediente

POST /api/indicios — Crear indicio

🛠 Desarrollo Local (sin Docker)
Backend


cd backend
npm install
cp .env.example .env
npm run dev

Frontend

cd frontend
npm install
npm run dev