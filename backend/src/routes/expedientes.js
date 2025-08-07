const express = require("express")
const Joi = require("joi")
const { getPool } = require("../config/database")
const { authenticateToken, requireRole } = require("../middleware/auth")

const router = express.Router()


router.use(authenticateToken)

/**
 * @swagger
 * /api/expedientes:
 *   get:
 *     summary: Obtener lista de expedientes
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de expedientes
 */
router.get("/", async (req, res, next) => {
  try {
  
    const page = Number.parseInt(req.query.page || 1, 10)
    const limit = Number.parseInt(req.query.limit || 10, 10)
    const { estado, search } = req.query
    const offset = (page - 1) * limit

    const pool = getPool()
    const request = pool.request()

 
    let whereClause = "e.is_active = 1"


    if (estado && estado !== "todos") {
      whereClause += " AND e.estado = @estado"
      request.input("estado", estado)
    }


    if (search) {
      whereClause += " AND (e.codigo LIKE @search OR e.descripcion LIKE @search OR u.nombre LIKE @search)"
      request.input("search", `%${search}%`)
    }


    if (req.user.rol === "tecnico") {
      whereClause += " AND e.tecnico_registra_id = @userId"
      request.input("userId", req.user.id)
    }

    const query = `
      SELECT 
        e.id, e.codigo, e.descripcion, e.ubicacion, e.fecha_hecho, e.numero_caso,
        e.tipo_delito, e.observaciones, e.estado, e.fecha_registro,
        u.nombre as tecnico_registra,
        c.nombre as coordinador_revisa,
        e.justificacion_rechazo,
  
        (SELECT COUNT(*) FROM indicios i WHERE i.expediente_id = e.id AND i.is_active = 1) as total_indicios
      FROM expedientes e
      LEFT JOIN usuarios u ON e.tecnico_registra_id = u.id
      LEFT JOIN usuarios c ON e.coordinador_revisa_id = c.id
      WHERE ${whereClause}
      ORDER BY e.fecha_registro DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `

    const result = await request.query(query)


    const countQuery = `
      SELECT COUNT(*) as total
      FROM expedientes e
      LEFT JOIN usuarios u ON e.tecnico_registra_id = u.id
      WHERE ${whereClause}
    `
    const countResult = await request.query(countQuery)

    res.json({
      success: true,
      data: {
        expedientes: result.recordset,
        pagination: {
          page,
          limit,
          total: countResult.recordset[0].total,
          pages: Math.ceil(countResult.recordset[0].total / limit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/expedientes/{id}:
 *   get:
 *     summary: Obtener expediente por ID
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del expediente
 *       404:
 *         description: Expediente no encontrado
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    const pool = getPool()
    const request = pool.request()

    let whereClause = "e.id = @id AND e.is_active = 1"
    request.input("id", id)

   
    if (req.user.rol === "tecnico") {
      whereClause += " AND e.tecnico_registra_id = @userId"
      request.input("userId", req.user.id)
    }

    const result = await request.query(`
      SELECT 
        e.*, 
        u.nombre as tecnico_registra,
        c.nombre as coordinador_revisa
      FROM expedientes e
      LEFT JOIN usuarios u ON e.tecnico_registra_id = u.id
      LEFT JOIN usuarios c ON e.coordinador_revisa_id = c.id
      WHERE ${whereClause}
    `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado o inactivo",
      })
    }

 
    const indiciosResult = await request.query(`
      SELECT 
        i.*,
        u.nombre as tecnico_registra
      FROM indicios i
      LEFT JOIN usuarios u ON i.tecnico_registra_id = u.id
      WHERE i.expediente_id = @id AND i.is_active = 1
      ORDER BY i.fecha_registro
    `)

    const expediente = result.recordset[0]
    expediente.indicios = indiciosResult.recordset

    res.json({
      success: true,
      data: expediente,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/expedientes/{id}/indicios:
 *   get:
 *     summary: Obtener indicios por expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de indicios del expediente
 */
router.get('/:id/indicios', async (req, res, next) => {
  try {
    const { id } = req.params

    const pool = getPool()
    const request = pool.request().input('expedienteId', id)

    const result = await request.query(`
      SELECT 
        i.*,
        u.nombre as tecnico_registra
      FROM indicios i
      LEFT JOIN usuarios u ON i.tecnico_registra_id = u.id
      WHERE i.expediente_id = @expedienteId AND i.is_active = 1
      ORDER BY i.fecha_registro
    `)

    res.json({
      success: true,
      data: result.recordset
    })
  } catch (error) {
    next(error)
  }
})


/**
 * @swagger
 * /api/expedientes:
 *   post:
 *     summary: Crear nuevo expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - ubicacion
 *               - fecha_hecho
 *               - tipo_delito
 *             properties:
 *               descripcion:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               fecha_hecho:
 *                 type: string
 *                 format: date-time
 *               tipo_delito:
 *                 type: string
 *               observaciones:
 *                 type: string
 *                 numero_caso:
 *                 type: string
 * 
 *     responses:
 *       201:
 *         description: Expediente creado exitosamente
 */
router.post("/", async (req, res, next) => {
  try {

    const schema = Joi.object({
      descripcion: Joi.string().required().max(500),
      ubicacion: Joi.string().required().max(300),
      fecha_hecho: Joi.date().required(),
      tipo_delito: Joi.string().required().max(50),
      observaciones: Joi.string().allow("").max(1000),
      numero_caso: Joi.string().required().max(300),
      prioridad: Joi.string().required().max(100)
    })

    const { error, value } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.details.map((detail) => detail.message),
      })
    }

    const pool = getPool()
    const request = pool.request()

    const year = new Date().getFullYear()
    const countResult = await request.query(`
      SELECT COUNT(*) as count 
      FROM expedientes 
      WHERE YEAR(fecha_registro) = ${year}
    `)
    const nextNumber = countResult.recordset[0].count + 1
    const codigo = `EXP-${year}-${nextNumber.toString().padStart(3, "0")}`

    
    const result = await request
      .input("codigo", codigo)
      .input("descripcion", value.descripcion)
      .input("ubicacion", value.ubicacion)
      .input("fecha_hecho", value.fecha_hecho)
      .input("tipo_delito", value.tipo_delito)
      .input("observaciones", value.observaciones || "")
      .input("tecnico_registra_id", req.user.id)
      .input("numero_caso", value.numero_caso)
      .input("prioridad", value.prioridad)
      .query(`
        INSERT INTO expedientes (
          codigo, descripcion, ubicacion, fecha_hecho, 
          tipo_delito, observaciones, tecnico_registra_id, numero_caso, prioridad, is_active
        )
        OUTPUT INSERTED.*
        VALUES (
          @codigo, @descripcion, @ubicacion, @fecha_hecho,
          @tipo_delito, @observaciones, @tecnico_registra_id, @numero_caso, @prioridad, 1
        )
      `)

    res.status(201).json({
      success: true,
      message: "Expediente creado exitosamente",
      data: result.recordset[0],
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/expedientes/{id}/enviar-revision:
 *   put:
 *     summary: Enviar expediente a revisión
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expediente enviado a revisión
 */
router.put("/:id/enviar-revision", async (req, res, next) => {
  try {
    const { id } = req.params

    const pool = getPool()
    const request = pool.request()

    const expedienteResult = await request
      .input("id", id)
      .input("userId", req.user.id)
      .query(`
        SELECT * FROM expedientes 
        WHERE id = @id AND tecnico_registra_id = @userId AND estado IN ('Borrador', 'Rechazado')
      `)

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado o no se puede enviar a revisión",
      })
    }


    const indiciosResult = await request.query(`
      SELECT COUNT(*) as count FROM indicios WHERE expediente_id = @id AND is_active = 1
    `)

    if (indiciosResult.recordset[0].count === 0) {
      return res.status(400).json({
        success: false,
        message: "El expediente debe tener al menos un indicio para enviar a revisión",
      })
    }

   
    await request.query(`
      UPDATE expedientes 
      SET estado = 'En Revision'
      WHERE id = @id
    `)

    res.json({
      success: true,
      message: "Expediente enviado a revisión exitosamente",
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/expedientes/{id}/aprobar:
 *   put:
 *     summary: Aprobar expediente (solo coordinadores)
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expediente aprobado
 */
router.put("/:id/aprobar", requireRole(["coordinador"]), async (req, res, next) => {
  try {
    const { id } = req.params

    const pool = getPool()


    const checkRequest = pool.request()
    const expedienteResult = await checkRequest
      .input("id", id)
      .query(`
        SELECT * FROM expedientes 
        WHERE id = @id   AND estado IN ('En Revision', 'Revisado') AND is_active = 1
      `)

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado, no está en revisión o está inactivo",
      })
    }

    const updateExpedienteRequest = pool.request()
    await updateExpedienteRequest
      .input("id", id)
      .input("coordinadorId", req.user.id)
      .query(`
        UPDATE expedientes 
        SET estado = 'Aprobado',
            coordinador_revisa_id = @coordinadorId,
            fecha_revision = GETDATE(),
            justificacion_rechazo = 'Aprobado'
        WHERE id = @id AND is_active = 1
      `)

    const updateIndiciosRequest = pool.request()
    await updateIndiciosRequest
      .input("id", id)
      .query(`
        UPDATE indicios
        SET estado = 'Aprobado'
        WHERE expediente_id = @id AND is_active = 1
      `)

    res.json({
      success: true,
      message: "Expediente e indicios aprobados exitosamente",
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/expedientes/{id}/rechazar:
 *   put:
 *     summary: Rechazar expediente (solo coordinadores)
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - justificacion
 *             properties:
 *               justificacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expediente rechazado
 */
router.put("/:id/rechazar", requireRole(["coordinador"]), async (req, res, next) => {
  try {
    const { id } = req.params
    const { justificacion } = req.body

    if (!justificacion || justificacion.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "La justificación del rechazo es requerida",
      })
    }

    const pool = getPool()

   
    const checkRequest = pool.request()
    const expedienteResult = await checkRequest.input("id", id).query(`
      SELECT * FROM expedientes 
      WHERE id = @id   AND estado IN ('En Revision', 'Revisado')  AND is_active = 1
    `)

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado, no está en revisión o está inactivo",
      })
    }

   
    const updateRequest = pool.request()
    await updateRequest
      .input("id", id)
      .input("coordinadorId", req.user.id)
      .input("justificacion", justificacion)
      .query(`
        UPDATE expedientes 
        SET estado = 'Rechazado',
            coordinador_revisa_id = @coordinadorId,
            justificacion_rechazo = @justificacion,
            fecha_revision = GETDATE()
        WHERE id = @id AND is_active = 1
      `)

    
    const updateIndiciosRequest = pool.request()
    await updateIndiciosRequest
      .input("id", id)
            .input("justificacion", justificacion)
      .query(`
        UPDATE indicios
        SET estado = 'Rechazado', razon_rechazo = @justificacion
        WHERE expediente_id = @id AND is_active = 1
      `)

    res.json({
      success: true,
      message: "Expediente e indicios rechazados exitosamente",
    })
  } catch (error) {
    next(error)
  }
})



/**
 * @swagger
 * /api/expedientes/{id}:
 *   put:
 *     summary: Actualiza un expediente por su ID
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_caso:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               fecha_hecho:
 *                 type: string
 *                 format: date
 *               tipo_delito:
 *                 type: string
 *               prioridad:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expediente actualizado correctamente
 *       404:
 *         description: Expediente no encontrado
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      numero_caso,
      descripcion,
      fecha_hecho,
      tipo_delito,
      prioridad,
      ubicacion
    } = req.body

    const pool = getPool()
    const request = pool.request()

    request
      .input('id', id)
      .input('numero_caso', numero_caso)
      .input('descripcion', descripcion)
      .input('fecha_hecho', fecha_hecho)
      .input('tipo_delito', tipo_delito)
      .input('prioridad', prioridad)
      .input('ubicacion', ubicacion)

    const result = await request.query(`
      UPDATE expedientes
      SET 
        numero_caso = @numero_caso,
        descripcion = @descripcion,
        fecha_hecho = @fecha_hecho,
        tipo_delito = @tipo_delito,
        prioridad = @prioridad,
        ubicacion = @ubicacion
      WHERE id = @id;

      SELECT * FROM expedientes WHERE id = @id
    `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expediente no encontrado'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Expediente actualizado correctamente',
      data: result.recordset[0]
    })
  } catch (error) {
    next(error)
  }
})


/**
 * @swagger
 * /api/expedientes/{id}/revisar:
 *   put:
 *     summary: Revisar indicios de un expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: string
 *                   enum: [Aprobado, Rechazado]
 *                 justificacion:
 *                   type: string
 *     responses:
 *       200:
 *         description: Revisión guardada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.put("/:id/revisar", requireRole(["coordinador"]), async (req, res, next) => {
  try {
    const { id } = req.params
    const revisiones = req.body 

    if (!revisiones || typeof revisiones !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Formato de revisión inválido"
      })
    }

    const pool = getPool()

    for (const [indicioId, { estado, justificacion }] of Object.entries(revisiones)) {
      if (!["Aprobado", "Rechazado"].includes(estado)) {
        continue 
      }

      const request = pool.request()
      await request
        .input("id", indicioId)
        .input("estado", estado)
        .input("justificacion", justificacion || null)
        .input("coordinadorId", req.user.id)
        .query(`
          UPDATE indicios
          SET 
            estado = @estado,
            razon_rechazo = @justificacion,
            fecha_revision = GETDATE(),
            coordinador_revisa_id = @coordinadorId
          WHERE id = @id AND is_active = 1
        `)
    }

 
    await pool.request()
      .input("id", id)
      .input("coordinadorId", req.user.id)
      .query(`
        UPDATE expedientes
        SET estado = 'Revisado',
            fecha_revision = GETDATE(),
            coordinador_revisa_id = @coordinadorId
        WHERE id = @id AND is_active = 1
      `)

    res.json({
      success: true,
      message: "Revisión guardada exitosamente"
    })
  } catch (error) {
    console.error("Error en la revisión:", error)
    res.status(500).json({
      success: false,
      message: "Error en la consulta SQL"
    })
  }
})

/**
 * @swagger
 * /api/expedientes/{id}/eliminar:
 *   put:
 *     summary: Eliminar (soft delete) un expediente y sus indicios
 *     description: Marca el expediente e indicios como inactivos (is_active=0). Solo permitido en estados Borrador o Rechazado.
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expediente eliminado (desactivado) exitosamente
 *       403:
 *         description: No tienes permisos para eliminar este expediente
 *       404:
 *         description: Expediente no encontrado o no se puede eliminar
 */
router.put("/:id/eliminar", async (req, res, next) => {
  try {
    const { id } = req.params
    const pool = getPool()


    const checkReq = pool.request()
    checkReq.input("id", id)

    let whereClause = "e.id = @id AND e.is_active = 1 AND e.estado IN ('Borrador','Rechazado')"
    if (req.user.rol === "tecnico") {
      whereClause += " AND e.tecnico_registra_id = @userId"
      checkReq.input("userId", req.user.id)
    }

    const expedienteResult = await checkReq.query(`
      SELECT e.id
      FROM expedientes e
      WHERE ${whereClause}
    `)

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado, inactivo o no se puede eliminar por su estado",
      })
    }

  
    const inactivaIndiciosReq = pool.request()
    await inactivaIndiciosReq
      .input("id", id)
      .query(`
        UPDATE indicios
        SET is_active = 0
        WHERE expediente_id = @id AND is_active = 1
      `)

  
    const inactivaExpReq = pool.request()
    await inactivaExpReq
      .input("id", id)
      .query(`
        UPDATE expedientes
        SET is_active = 0
        WHERE id = @id AND is_active = 1
      `)

    res.json({
      success: true,
      message: "Expediente e indicios desactivados correctamente",
    })
  } catch (error) {
    next(error)
  }
})



module.exports = router
