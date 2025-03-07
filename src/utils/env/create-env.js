const fs = require("fs");

const isDevelopment = process.env.NODE_ENV !== "production";

// get correct url based on env

const backendUrl = isDevelopment
  ? process.env.LOCAL_BACKEND_URL || "http://localhost:3000"
  : process.env.PROD_BACKEND_URL || "";
const frontendUrl = isDevelopment
  ? process.env.LOCAL_BACKEND_URL || "http://localhost:8080"
  : process.env.PROD_FRONTEND_URL || "";

const envConfig = `
window.BACKEND_URL = "${backendUrl}";
window.FRONTEND_URL = "${frontendUrl}";
window.ENV = "${isDevelopment ? 'development' : 'production'}";
console.log("Environment config loaded:", "${isDevelopment ? 'development' : 'production'}");
`;

fs.writeFileSync('./public/env-config.js', envConfig);


console.log(`Created env-config.js for ${isDevelopment ? 'development' : 'production'} environment`);
console.log(`BACKEND_URL: ${backendUrl}`);
console.log(`FRONTEND_URL: ${frontendUrl}`);
