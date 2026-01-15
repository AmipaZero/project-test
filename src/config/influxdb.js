import dotenv from 'dotenv';
dotenv.config();

export default {
    url: process.env.INFLUX_URL,
    db: process.env.INFLUX_DB,
    token: process.env.INFLUX_TOKEN
};