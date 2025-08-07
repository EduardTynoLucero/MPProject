const jwt = require("jsonwebtoken")
const { getPool } = require("../config/database")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

  
    const pool = getPool()
    const request = pool.request()
    const result = await request
      .input("userId", decoded.userId)
      .query("SELECT id, username, email, nombre, rol, activo FROM usuarios WHERE id = @userId AND activo = 1")

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario no válido o inactivo",
      })
    }

    req.user = result.recordset[0]
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token no válido",
    })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
}
