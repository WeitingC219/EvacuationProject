const SensorModel = require('./model');

module.exports = class Sensor {
  static async getSensorData(req, res) {
    try {
      let result;
      switch (req.params.type) {
        case 'temperatureSensor':
          result = await SensorModel.TempSensor.find({ bindTagId: req.params.id })
            .sort({ createdAt: -1 }).limit(7).exec();
          break;
        case 'moistureSensor':
          result = await SensorModel.MoistSensor.find({ bindTagId: req.params.id })
            .sort({ createdAt: -1 }).limit(7).exec();
          break;
        default:
          result = [];
      }
      res.send(result);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  static async postSensorData(req, res) {
    try {
      let sensor;
      switch (req.params.type) {
        case 'temperatureSensor':
          sensor = new SensorModel.TempSensor(req.body);
          break;
        case 'deflection':
          sensor = new SensorModel.MoistSensor(req.body);
          break;
        default:
          sensor = null;
      }
      const result = await sensor.save();
      res.send(result);
    } catch (error) {
      res.status(500).send(error);
    }
  }
};
