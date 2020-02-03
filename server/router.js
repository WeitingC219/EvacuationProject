const express = require('express');

const router = express.Router();

const sensorModifyMethod = require('./controller');

router.get('/sensor/:type/data/:id', sensorModifyMethod.getSensorData);
router.post('/sensor/:type', sensorModifyMethod.postSensorData);

module.exports = router;
