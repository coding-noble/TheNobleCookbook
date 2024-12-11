const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "The Noble Cookbook API",
        description: "Swagger API documentation for the Noble Cookbook web service."
    },
    host: process.env.HOST || 'localhost:2600',
    schemes: ['http', 'https']
};

const outputFile = "./swagger.json";
const endpointsFile = ["../routes/index.js"];

swaggerAutogen(outputFile, endpointsFile, doc)