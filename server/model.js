const mongoose = require('mongoose');

const { Schema } = mongoose;

const sensorSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    temperature: {
      type: Number,
      require: true,
    },
    bindTagId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

module.exports = {
  TempSensor: mongoose.model('temperature_sensor', sensorSchema),
  MoistSensor: mongoose.model('moisture_sensor', sensorSchema),
};
