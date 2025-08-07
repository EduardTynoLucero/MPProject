const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Joi = require("joi")
const { getPool } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", async (req, res, next) => {
  try {
    // Validación
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })

    const { error, value } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: error.details.map((detail) => detail.message),
      })
    }

    const { username, password } = value

    
    const pool = getPool()
    const request = pool.request()
    const result = await request.input("username", username).query(`
        SELECT id, username, email, password, nombre, rol, activo 
        FROM usuarios 
        WHERE (username = @username ) AND activo = 1
      `)

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    const user = result.recordset[0]

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Generar token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      
    )

    // Respuesta exitosa
    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  })
})

module.exports = router
