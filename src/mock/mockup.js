import axios from 'axios';
import config from '../config/influxdb.js';

const PANELS = ["PANEL_LANTAI_1", "PANEL_LANTAI_2", "PANEL_LANTAI_3"];
const INTERVAL_MS = 2000; 
const FIXED_TIME = new Date('2023-07-01T12:30:05Z'); 
const KWH_START = 1250; 

const lastKwhMap = {};
PANELS.forEach(p => lastKwhMap[p] = KWH_START + Math.random() * 100);

function generatePanelData(lastKwh) {
    const v_avg = (218 + Math.random() * 5).toFixed(1);
    const kW = (1.0 + Math.random() * 2).toFixed(2);
    const i_avg = ((kW * 1000) / v_avg).toFixed(2);
    const kWh = lastKwh + parseFloat((Math.random() * 5).toFixed(2));
    return { v_avg, i_avg, kW, kWh };
}

async function sendToInflux(panelId, data, timestamp) {
    const ts = Math.floor(timestamp.getTime() / 1000); 
    const line = `power_meter,pmCode=${panelId} v_avg=${data.v_avg},i_avg=${data.i_avg},kW=${data.kW},kWh=${data.kWh} ${ts}`;
    try {
        await axios.post(
            `${config.url}/api/v2/write?bucket=${config.db}&precision=s`,
            line,
            {
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Accept': 'application/json'
                }
            }
        );
        console.log(`[${timestamp.toISOString()}]  ${panelId} kWh=${data.kWh}`);
    } catch (err) {
        console.error(`[${panelId}] Write Error:`, err.response?.data || err.message);
    }
}

function startMockup() {
    console.log(`start : ${PANELS.join(', ')} every ${INTERVAL_MS / 1000}s`);

    setInterval(async () => {
        for (const panel of PANELS) {
            const lastKwh = lastKwhMap[panel];
            const data = generatePanelData(lastKwh);

            lastKwhMap[panel] = data.kWh; 
            await sendToInflux(panel, data, FIXED_TIME); 
        }
    }, INTERVAL_MS);
}

startMockup();
