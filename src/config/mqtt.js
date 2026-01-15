import dotenv from 'dotenv';
dotenv.config();

export default {
    broker: process.env.MQTT_BROKER,
    kwhRate: parseFloat(process.env.KWH_RATE) || 1500
};