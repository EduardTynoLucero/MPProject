const sql = require("mssql")

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool

const connectDB = async () => {
  try {
    pool = await sql.connect(config)
    console.log("Conectado a SQL Server")

    await createTables()
    await insertInitialData()

    return pool
  } catch (error) {
    console.error(" Error conectando a la base de datos:", error)
    throw error
  }
}

const createTables = async () => {
  try {
    const request = pool.request()

  
 

   
 
    await request.query(`
    /* =========================================
      USUARIOS
      ========================================= */
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usuarios]') AND type = 'U')
    BEGIN
        CREATE TABLE dbo.usuarios(
          id INT IDENTITY(1,1) PRIMARY KEY,
            username NVARCHAR(50) UNIQUE NOT NULL,
            email NVARCHAR(100) UNIQUE NOT NULL,
            password NVARCHAR(255) NOT NULL,
            nombre NVARCHAR(100) NOT NULL,
            rol NVARCHAR(20) NOT NULL DEFAULT 'tecnico',
            activo BIT DEFAULT 1,
            fecha_creacion DATETIME DEFAULT GETDATE(),
            fecha_actualizacion DATETIME DEFAULT GETDATE()
        );
    END;

    ------------------------------------------------
    -- EXPEDIENTES
    ------------------------------------------------
      IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[expedientes]') AND type = 'U')
        BEGIN
        CREATE TABLE dbo.expedientes (
        id                    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_expedientes PRIMARY KEY,
        codigo                NVARCHAR(40)      NOT NULL,
        descripcion           NVARCHAR(1000)    NOT NULL,
        ubicacion             NVARCHAR(300)     NOT NULL,
        fecha_hecho           DATETIME          NOT NULL,
        tipo_delito           NVARCHAR(100)     NOT NULL,
        observaciones         NTEXT              NULL,
        estado                NVARCHAR(50)      NOT NULL CONSTRAINT DF_expedientes_estado DEFAULT ('Borrador'),
        tecnico_registra_id   INT               NOT NULL,
        coordinador_revisa_id INT               NULL,
        justificacion_rechazo NTEXT              NULL,
        fecha_registro        DATETIME          NOT NULL CONSTRAINT DF_expedientes_fecha_registro DEFAULT (GETDATE()),
        fecha_revision        DATETIME          NULL,
        numero_caso           VARCHAR(50)       NULL,
        prioridad             VARCHAR(50)       NULL,
        is_active             BIT               NOT NULL CONSTRAINT DF_expedientes_is_active DEFAULT (1),
        FOREIGN KEY (tecnico_registra_id)   REFERENCES usuarios(id),
        FOREIGN KEY (coordinador_revisa_id) REFERENCES usuarios(id)
    );

    END;

    -- UQ en codigo
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_expedientes_codigo' AND object_id = OBJECT_ID(N'dbo.expedientes'))
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UQ_expedientes_codigo
            ON dbo.expedientes(codigo);
    END;

    ------------------------------------------------
    -- INDICIOS
    ------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[indicios]') AND type = 'U')
    BEGIN
      CREATE TABLE dbo.indicios (
        id                    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_indicios PRIMARY KEY,
        codigo                NVARCHAR(40)      NOT NULL,
        expediente_id         INT               NOT NULL,
        descripcion           NVARCHAR(1000)    NOT NULL,
        color                 NVARCHAR(100)     NULL,
        tamanio               NVARCHAR(100)     NULL,
        peso                  NVARCHAR(100)     NULL,
        ubicacion             NVARCHAR(300)     NULL,
        observaciones         NTEXT              NULL,
        tecnico_registra_id   INT               NOT NULL,
        fecha_registro        DATETIME          NOT NULL CONSTRAINT DF_indicios_fecha_registro DEFAULT (GETDATE()),
        numero_evidencia      VARCHAR(100)      NULL,
        tipo                  VARCHAR(100)      NULL,
        fecha_recoleccion     DATE              NULL,
        cadena_custodia       VARCHAR(100)      NULL,
        is_active             BIT               NOT NULL CONSTRAINT DF_indicios_is_active DEFAULT (1),
        estado                VARCHAR(50)       NULL CONSTRAINT DF_indicios_estado DEFAULT ('Borrador'),
        razon_rechazo         NVARCHAR(1000)    NULL,
        fecha_revision        DATETIME          NULL,
        coordinador_revisa_id INT               NULL,
        FOREIGN KEY (expediente_id)         REFERENCES expedientes(id) ON DELETE CASCADE,
        FOREIGN KEY (tecnico_registra_id)   REFERENCES usuarios(id),
        FOREIGN KEY (coordinador_revisa_id) REFERENCES usuarios(id)
    );

    END;
    `);


    console.log(" Tablas creadas correctamente")
  } catch (error) {
    console.error(" Error creando tablas:", error)
    throw error
  }
}

const insertInitialData = async () => {
  try {
    const request = pool.request()

    // Verificar si ya existen usuarios
    const userCount = await request.query("SELECT COUNT(*) as count FROM usuarios")

    if (userCount.recordset[0].count === 0) {
      const bcrypt = require("bcryptjs")

      // Crear usuarios iniciales
      const hashedPassword = await bcrypt.hash("123456", 10)

      await request.query(`
        INSERT INTO usuarios (username, email, password, nombre, rol) VALUES
        ('admin', 'admin@dicri.gov.co', '${hashedPassword}', 'Administrador Sistema', 'coordinador'),
        ('juan.perez', 'juan.perez@dicri.gov.co', '${hashedPassword}', 'Juan Pérez', 'tecnico'),
        ('maria.garcia', 'maria.garcia@dicri.gov.co', '${hashedPassword}', 'María García', 'tecnico'),
        ('carlos.lopez', 'carlos.lopez@dicri.gov.co', '${hashedPassword}', 'Carlos López', 'coordinador')
      `)

      console.log("✅ Usuarios iniciales creados")
    }
  } catch (error) {
    console.error("❌ Error insertando datos iniciales:", error)
  }
}

const getPool = () => {
  if (!pool) {
    throw new Error("Base de datos no conectada")
  }
  return pool
}

module.exports = {
  connectDB,
  getPool,
  sql,
}
