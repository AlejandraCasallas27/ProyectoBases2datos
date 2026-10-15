
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'VetCare REST API',
    version: '1.0.0',
    description: 'Veterinary clinic management REST API'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Users' },
    { name: 'Sessions' },
    { name: 'Pets' },
    { name: 'Services' },
    { name: 'Appointments' },
    { name: 'Reviews' },
    { name: 'Medical Records' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              status: {
                type: 'integer'
              },
              message: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  paths: {}
};

const docsDirectory = __dirname;

const yamlFiles = fs.readdirSync(docsDirectory)
  .filter((file) => file.endsWith('.yaml'))
  .sort();

for (const file of yamlFiles) {
  const filePath = path.join(docsDirectory, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const document = YAML.parse(content);

  if (!document || !document.paths) {
    throw new Error(`Missing paths in ${file}`);
  }

  for (const [route, operations] of Object.entries(document.paths)) {
    swaggerSpec.paths[route] = {
      ...(swaggerSpec.paths[route] || {}),
      ...operations
    };
  }
}

module.exports = swaggerSpec;
