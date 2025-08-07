const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DICRI API",
      version: "1.0.0",
      description: "Sistema de Gestión de Evidencias DICRI",
      contact: {
        name: "Equipo DICRI",
        email: "soporte@dicri.gov.co",
      },
    },
    servers: [
      {
        url: "http://localhost:3007",
        description: "Servidor de Desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
}

const specs = swaggerJsdoc(options)

const swaggerSetup = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "DICRI API Documentation",
    }),
  )
}

module.exports = swaggerSetup
