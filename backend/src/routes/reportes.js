const express = require("express")
const { getPool } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()


router.use(authenticateToken)

function getFiltroFechasYEstado(q) {
  const fecha_inicio = q.fecha_inicio || q.fecha_desde || null
  const fecha_fin    = q.fecha_fin    || q.fecha_hasta || null
  const estado       = q.estado && q.estado !== "todos" ? q.estado : null
  return { fecha_inicio, fecha_fin, estado }
}

function applyWhereAndInputs({ request, where, fecha_inicio, fecha_fin, estado, user, alias = '' }) {
  let wc = where || '1=1'
  const p = (c) => (alias ? `${alias}.${c}` : c)

  if (estado) {
    wc += ` AND ${p('estado')} = @estado`
    request.input('estado', estado)
  }
  if (fecha_inicio) {
    wc += ` AND ${p('fecha_registro')} >= @fecha_inicio`
    request.input('fecha_inicio', fecha_inicio)
  }
  if (fecha_fin) {
    wc += ` AND ${p('fecha_registro')} <= @fecha_fin`
    request.input('fecha_fin', fecha_fin)
  }
  if (user?.rol === 'tecnico') {
    wc += ` AND ${p('tecnico_registra_id')} = @userId`
    request.input('userId', user.id)
  }
  return wc
}

/* ===========================================================
 *  1) ESTADÍSTICAS
 * =========================================================== */
/**
 * @swagger
 * /api/reportes/estadisticas:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 */
router.get("/estadisticas", async (req, res, next) => {
  try {
    const pool = getPool()
    const request = pool.request()
    const { fecha_inicio, fecha_fin } = getFiltroFechasYEstado(req.query)

    const whereClause = applyWhereAndInputs({
      request,
      where: '1=1',
      fecha_inicio,
      fecha_fin,
      estado: null,
      user: req.user
    })

    const estadosResult = await request.query(`
      SELECT estado, COUNT(*) AS cantidad
      FROM expedientes
      WHERE ${whereClause}
      GROUP BY estado
    `)

    const tecnicosResult = await request.query(`
      SELECT u.nombre,
             COUNT(*) AS expedientes,
             SUM(CASE WHEN e.estado = 'Aprobado' THEN 1 ELSE 0 END) AS aprobados,
             SUM(CASE WHEN e.estado = 'Rechazado' THEN 1 ELSE 0 END) AS rechazados
      FROM expedientes e
      JOIN usuarios u ON e.tecnico_registra_id = u.id
      WHERE ${whereClause}
      GROUP BY u.id, u.nombre
      ORDER BY expedientes DESC
    `)

    const delitosResult = await request.query(`
      SELECT tipo_delito, COUNT(*) AS cantidad
      FROM expedientes
      WHERE ${whereClause}
      GROUP BY tipo_delito
      ORDER BY cantidad DESC
    `)

    const mesesResult = await request.query(`
      SELECT YEAR(fecha_registro) AS año,
             MONTH(fecha_registro) AS mes,
             COUNT(*) AS expedientes,
             SUM(CASE WHEN estado = 'Aprobado' THEN 1 ELSE 0 END) AS aprobados,
             SUM(CASE WHEN estado = 'Rechazado' THEN 1 ELSE 0 END) AS rechazados
      FROM expedientes
      WHERE ${whereClause}
      GROUP BY YEAR(fecha_registro), MONTH(fecha_registro)
      ORDER BY año DESC, mes DESC
    `)

    const indiciosResult = await request.query(`
      SELECT COUNT(*) AS total_indicios
      FROM indicios i
      JOIN expedientes e ON i.expediente_id = e.id
      WHERE ${whereClause.replace("fecha_registro", "e.fecha_registro")
                          .replace("tecnico_registra_id", "e.tecnico_registra_id")}
    `)

    res.json({
      success: true,
      data: {
        por_estado: estadosResult.recordset,
        por_tecnico: tecnicosResult.recordset,
        por_delito: delitosResult.recordset,
        por_mes: mesesResult.recordset,
        total_indicios: indiciosResult.recordset[0].total_indicios,
      },
    })
  } catch (error) {
    next(error)
  }
})

/* ===========================================================
 *  2) EXPEDIENTES POR MES
 * =========================================================== */
/**
 * @swagger
 * /api/reportes/expedientes-por-mes:
 *   get:
 *     summary: Obtener cantidad de expedientes agrupados por mes
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de expedientes por mes
 */
router.get("/expedientes-por-mes", async (req, res, next) => {
  try {
    const pool = getPool()
    const request = pool.request()
    const { fecha_inicio, fecha_fin, estado } = getFiltroFechasYEstado(req.query)

    const whereClause = applyWhereAndInputs({
      request,
      where: '1=1',
      fecha_inicio,
      fecha_fin,
      estado,
      user: req.user,
      alias: 'e'
    })

    const result = await request.query(`
      SELECT YEAR(e.fecha_registro) AS anio,
             MONTH(e.fecha_registro) AS mes_num,
             DATENAME(month, e.fecha_registro) AS mes_largo,
             COUNT(*) AS cantidad,
             SUM(CASE WHEN e.estado = 'Aprobado' THEN 1 ELSE 0 END) AS aprobados,
             SUM(CASE WHEN e.estado = 'Rechazado' THEN 1 ELSE 0 END) AS rechazados
      FROM expedientes e
      WHERE ${whereClause}
      GROUP BY YEAR(e.fecha_registro), MONTH(e.fecha_registro), DATENAME(month, e.fecha_registro)
      ORDER BY anio, mes_num
    `)

    res.json({ success: true, data: result.recordset })
  } catch (error) {
    next(error)
  }
})

/* ===========================================================
 *  3) INDICIOS POR TIPO
 * =========================================================== */
/**
 * @swagger
 * /api/reportes/indicios-por-tipo:
 *   get:
 *     summary: Obtener cantidad de indicios agrupados por tipo
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de indicios por tipo
 */
router.get("/indicios-por-tipo", async (req, res, next) => {
  try {
    const pool = getPool()
    const request = pool.request()
    const { fecha_inicio, fecha_fin, estado } = getFiltroFechasYEstado(req.query)

    const whereClause = applyWhereAndInputs({
      request,
      where: '1=1',
      fecha_inicio,
      fecha_fin,
      estado,
      user: req.user,
      alias: 'e'
    })

    const result = await request.query(`
      SELECT i.tipo AS name, COUNT(*) AS cantidad
      FROM indicios i
      JOIN expedientes e ON e.id = i.expediente_id
      WHERE ${whereClause}
      GROUP BY i.tipo
      ORDER BY cantidad DESC
    `)

    res.json({ success: true, data: result.recordset })
  } catch (error) {
    next(error)
  }
})

/* ===========================================================
 *  4) RECIENTES
 * =========================================================== */
/**
 * @swagger
 * /api/reportes/recientes:
 *   get:
 *     summary: Obtener lista de expedientes recientes
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de expedientes recientes
 */
router.get("/recientes", async (req, res, next) => {
  try {
    const pool = getPool()
    const request = pool.request()
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 10, 100))
    const { fecha_inicio, fecha_fin, estado } = getFiltroFechasYEstado(req.query)

    const whereClause = applyWhereAndInputs({
      request,
      where: '1=1',
      fecha_inicio,
      fecha_fin,
      estado,
      user: req.user,
      alias: 'e'
    })

    const result = await request.query(`
      SELECT TOP (${limit})
        e.id,
        e.codigo,
        e.descripcion,
        e.estado,
        e.tipo_delito,
        e.fecha_registro,
        u.nombre AS tecnico
      FROM expedientes e
      LEFT JOIN usuarios u ON u.id = e.tecnico_registra_id
      WHERE ${whereClause}
      ORDER BY e.fecha_registro DESC
    `)

    res.json({ success: true, data: result.recordset })
  } catch (error) {
    next(error)
  }
})

module.exports = router
