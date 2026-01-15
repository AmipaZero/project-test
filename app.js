import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express from 'express';
import panelRoutes from './src/route/panelRoute.js';
import startMqttListener from './src/listener/mqttListener.js'; // Import di sini

const app = express();
app.use(express.json());

// Routes
app.use('/api/panels', panelRoutes);

// Jalankan MQTT Listener
startMqttListener();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
    
});