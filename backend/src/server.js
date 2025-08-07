const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
require("dotenv").config()

const swaggerSetup = require("./config/swagger")
const { connectDB } = require("./config/database")
const errorHandler = require("./middleware/errorHandler")

// Routes
const authRoutes = require("./routes/auth")
const expedientesRoutes = require("./routes/expedientes")
const indiciosRoutes = require("./routes/indicios")
const reportesRoutes = require("./routes/reportes")

const app = express()
const PORT = process.env.PORT || 3007

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3007",
    credentials: true,
  }),
)
app.use(morgan("combined"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Swagger Documentation
swaggerSetup(app)

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "DICRI Backend API",
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/expedientes", expedientesRoutes)
app.use("/api/indicios", indiciosRoutes)
app.use("/api/reportes", reportesRoutes)

// Error Handler
app.use(errorHandler)

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint no encontrado",
  })
})

// Start Server
const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`)
      console.log(`Documentación: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error(" Error iniciando servidor:", error)
    process.exit(1)
  }
}

startServer()

module.exports = app
