const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

 
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.details.map((detail) => detail.message),
    })
  }


  if (err.code) {
    switch (err.code) {
      case "EREQUEST":
        return res.status(400).json({
          success: false,
          message: "Error en la consulta SQL",
        })
      case "ELOGIN":
        return res.status(500).json({
          success: false,
          message: "Error de conexión a la base de datos",
        })
      default:
        return res.status(500).json({
          success: false,
          message: "Error interno del servidor",
        })
    }
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  })
}

module.exports = errorHandler
