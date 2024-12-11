const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "The Noble Cookbook API",
        description: "Swagger API documentation for the Noble Cookbook web service."
    },
    host: "the-noble-cookbook.onrender.com",
    schemes: ['https']
};

const outputFile = "./swagger.json";
const endpointsFile = ["../routes/index.js"];

swaggerAutogen(outputFile, endpointsFile, doc)