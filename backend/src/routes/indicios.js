const express = require("express")
const Joi = require("joi")
const { getPool } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()


router.use(authenticateToken)

/**
 * @swagger
 * /api/indicios/expediente/{expedienteId}:
 *   get:
 *     summary: Obtener indicios de un expediente
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de indicios del expediente
 */
router.get("/expediente/:expedienteId", async (req, res, next) => {
  try {
    const { expedienteId } = req.params

    const pool = getPool()
    const request = pool.request()

    let whereClause = "e.id = @expedienteId"
    request.input("expedienteId", expedienteId)

    if (req.user.rol === "tecnico") {
      whereClause += " AND e.tecnico_registra_id = @userId"
      request.input("userId", req.user.id)
    }

    const expedienteResult = await request.query(`
      SELECT id FROM expedientes e WHERE ${whereClause}
    `)

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado",
      })
    }

    
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
      data: result.recordset,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/indicios:
 *   post:
 *     summary: Crear nuevo indicio
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expediente_id
 *               - descripcion
 *               - ubicacion
 *             properties:
 *               expediente_id:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               color:
 *                 type: string
 *               tamanio:
 *                 type: string
 *               peso:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Indicio creado exitosamente
 */
router.post("/", async (req, res, next) => {
  try {
  
    const schema = Joi.object({
      expediente_id: Joi.number().integer().required(),
      descripcion: Joi.string().required().max(500),
      color: Joi.string().allow("").max(50),
      tamanio: Joi.string().allow("").max(100),
      peso: Joi.string().allow("").max(50),
      ubicacion: Joi.string().required().max(300),
      observaciones: Joi.string().allow("").max(1000),
      numero_evidencia: Joi.string().allow("").max(100),
      tipo: Joi.string().allow("").max(100),
      fecha_recoleccion: Joi.date().iso().required(),
      cadena_custodia: Joi.string().allow("").max(100),
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

    
    let whereClause = "id = @expedienteId AND estado IN ('Borrador', 'Rechazado')"
    request.input("expedienteId", value.expediente_id)

    if (req.user.rol === "tecnico") {
      whereClause += " AND tecnico_registra_id = @userId"
      request.input("userId", req.user.id)
    }

    const expedienteResult = await request.query(`
      SELECT id FROM expedientes WHERE ${whereClause}
    `)

    if (expedienteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expediente no encontrado o no se puede modificar",
      })
    }


    const countResult = await request.query(`
      SELECT COUNT(*) as count FROM indicios WHERE expediente_id = @expedienteId
    `)
    const nextNumber = countResult.recordset[0].count + 1
    const codigo = `IND-${nextNumber.toString().padStart(3, "0")}`

    const result = await request
  .input("codigo", codigo)
  .input("descripcion", value.descripcion)
  .input("color", value.color || "")
  .input("tamanio", value.tamanio || "")
  .input("peso", value.peso || "")
  .input("ubicacion", value.ubicacion)
  .input("observaciones", value.observaciones || "")
  .input("tecnico_registra_id", req.user.id)
  .input("numero_evidencia", value.numero_evidencia || "")
  .input("tipo", value.tipo || "")
  .input("fecha_recoleccion", value.fecha_recoleccion) 
  .input("cadena_custodia", value.cadena_custodia || "")
  .query(`
    INSERT INTO indicios (
      codigo, expediente_id, descripcion, color, tamanio, 
      peso, ubicacion, observaciones, tecnico_registra_id, 
      numero_evidencia, tipo, fecha_recoleccion ,cadena_custodia
    )
    OUTPUT INSERTED.*
    VALUES (
      @codigo, @expedienteId, @descripcion, @color, @tamanio,
      @peso, @ubicacion, @observaciones, @tecnico_registra_id, 
      @numero_evidencia, @tipo, @fecha_recoleccion, @cadena_custodia  
    )
  `)


    res.status(201).json({
      success: true,
      message: "Indicio creado exitosamente",
      data: result.recordset[0],
    })
  } catch (error) {
    next(error)
  }
})


/**
 * @swagger
 * /api/indicios/{id}:
 *   put:
 *     summary: Actualizar un indicio
 *     tags: [Indicios]
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
 *               descripcion:
 *                 type: string
 *               color:
 *                 type: string
 *               tamanio:
 *                 type: string
 *               peso:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               observaciones:
 *                 type: string
 *               numero_evidencia:
 *                 type: string
 *               tipo:
 *                 type: string
 *               fecha_recoleccion:
 *                 type: string
 *                 format: date
 *               cadena_custodia:
 *                 type: string
 *     responses:
 *       200:
 *         description: Indicio actualizado exitosamente
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    const schema = Joi.object({
      descripcion: Joi.string().required().max(500),
      color: Joi.string().allow("").max(50),
      tamanio: Joi.string().allow("").max(100),
      peso: Joi.string().allow("").max(50),
      ubicacion: Joi.string().required().max(300),
      observaciones: Joi.string().allow("").max(1000),
      numero_evidencia: Joi.string().allow("").max(100),
      tipo: Joi.string().allow("").max(100),
      fecha_recoleccion: Joi.date().iso().required(),
      cadena_custodia: Joi.string().allow("").max(100),
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

  
    request.input("id", id)
    let whereClause = "i.id = @id"
    if (req.user.rol === "tecnico") {
      whereClause += " AND i.tecnico_registra_id = @userId"
      request.input("userId", req.user.id)
    }

    const indicioResult = await request.query(`
      SELECT i.id FROM indicios i
      INNER JOIN expedientes e ON e.id = i.expediente_id
      WHERE ${whereClause}
    `)

    if (indicioResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Indicio no encontrado o no tienes permisos",
      })
    }

   
    const result = await request
      .input("descripcion", value.descripcion)
      .input("color", value.color || "")
      .input("tamanio", value.tamanio || "")
      .input("peso", value.peso || "")
      .input("ubicacion", value.ubicacion)
      .input("observaciones", value.observaciones || "")
      .input("numero_evidencia", value.numero_evidencia || "")
      .input("tipo", value.tipo || "")
      .input("fecha_recoleccion", value.fecha_recoleccion)
      .input("cadena_custodia", value.cadena_custodia || "")
      .query(`
        UPDATE indicios SET
          descripcion = @descripcion,
          color = @color,
          tamanio = @tamanio,
          peso = @peso,
          ubicacion = @ubicacion,
          observaciones = @observaciones,
          numero_evidencia = @numero_evidencia,
          tipo = @tipo,
          fecha_recoleccion = @fecha_recoleccion,
          cadena_custodia = @cadena_custodia
        WHERE id = @id;
        SELECT * FROM indicios WHERE id = @id;
      `)

    res.json({
      success: true,
      message: "Indicio actualizado exitosamente",
      data: result.recordset[0],
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/indicios/{id}/logico:
 *   delete:
 *     summary: Eliminar lógicamente un indicio (is_active = 0)
 *     tags: [Indicios]
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
 *         description: Indicio eliminado lógicamente
 */
router.delete("/:id/logico", async (req, res, next) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const request = pool.request().input("id", id)

    let whereClause = "i.id = @id"
    if (req.user.rol === "tecnico") {
      whereClause += " AND i.tecnico_registra_id = @userId"
      request.input("userId", req.user.id)
    }

    
    const indicioCheck = await request.query(`
      SELECT i.id FROM indicios i
      INNER JOIN expedientes e ON e.id = i.expediente_id
      WHERE ${whereClause}
    `)

    if (indicioCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Indicio no encontrado o no tienes permisos",
      })
    }

   
    await request.query(`
      UPDATE indicios SET is_active = 0 WHERE id = @id
    `)

    res.json({
      success: true,
      message: "Indicio eliminado lógicamente (is_active = 0)",
    })
  } catch (error) {
    next(error)
  }
})




module.exports = router
