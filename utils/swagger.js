const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: "The Noble Cookbook API",
        description: "Swagger API documentation for the Noble Cookbook web service."
    },
    host: process.env.NODE_ENV === 'production' ? 'your-production-host.com' : 'localhost:2600',
    schemes: [process.env.NODE_ENV === 'production' ? 'https' : 'http']
};

const outputFile = "./swagger.json";
const endpointsFile = ["../routes/index.js"];

swaggerAutogen(outputFile, endpointsFile, doc)