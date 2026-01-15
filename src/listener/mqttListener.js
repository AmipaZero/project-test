import mqtt from 'mqtt';
import mqttConfig from '../config/mqtt.js';
import PanelRepository from '../repository/PanelRepository.js';

const startMqttListener = () => {
    const mqttClient = mqtt.connect(mqttConfig.broker);

    mqttClient.on('connect', () => {
        console.log("Connected to MQTT Broker: " + mqttConfig.broker);
        mqttClient.subscribe('DATA/PM/#');
    });

    mqttClient.on('message', async (topic, message) => {
        const panelId = topic.split('/').pop();
        try {
            const payload = JSON.parse(message.toString());
            if (payload.status === "OK") {
                const d = payload.data;
                
                await PanelRepository.writeData(panelId, {
                    v: d.v[3], 
                    i: d.i[3], 
                    kW: d.kW, 
                    kWh: d.kWh,
                    time: d.time 
                });
                
                console.log(`[${new Date().toLocaleTimeString()}] Data ${panelId}`);
            }
        } catch (e) {
            console.error("MQTT Error: " + e.message);
        }
    });

    return mqttClient;
};

export default startMqttListener;