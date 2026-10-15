
require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const petRoutes = require('./routes/petRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api-docs.json', (req, res) => {
  return res.status(200).json(swaggerSpec);
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: '/api-docs.json'
    }
  })
);

app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    application: 'VetCare API'
  });
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes);

app.use((req, res) => {
  return res.status(404).json({
    error: {
      status: 404,
      message: 'Endpoint not found'
    }
  });
});

app.use(errorHandler);

app.listen(port, () => {
  process.stdout.write(`Server running on port ${port}\n`);
});
