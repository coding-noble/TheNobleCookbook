const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../utils/swagger.json");

const router = express.Router();

router.use("/", swaggerUi.serve);
router.use("/", swaggerUi.setup(swaggerDocument));

module.exports = router; // Export the router
