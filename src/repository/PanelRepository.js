import axios from 'axios';
import config from '../config/influxdb.js';

class PanelRepository {
    async _executeQueries(q) {
        try {
            const res = await axios.get(`${config.url}/query`, {
                params: { db: config.db, q, epoch: 's' },
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Accept': 'application/json' 
                }
            });
            return res.data;
        } catch (e) {
            console.error("InfluxDB Query Error: " + e.message);
            return null;
        }
    }
    async getLatestData(panelId) {
    const q = `SELECT "v_avg", "i_avg", "kW", "kWh" FROM "power_meter" WHERE "pmCode"='${panelId}' ORDER BY time DESC LIMIT 1`;
    const data = await this._executeQueries(q);

    const series = data?.results[0]?.series?.[0];
    if (!series) return null;

    const result = {};

    series.columns.forEach((col, i) => {
        const value = series.values[0][i];
        if (value !== null) {
            result[col] = value;
        }
    });

    result.voltage = result.v_avg;
    result.current = result.i_avg;
    result.power = result.kW;
    result.energy = result.kWh;

    if (result.time) {
        result.time = new Date(result.time * 1000).toISOString();
    }

    return result;
}

    async getFirstKwhToday(panelId) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const startTime = start.toISOString();

        const q = `SELECT first("kWh") FROM "power_meter" WHERE "pmCode"='${panelId}' AND time >= '${startTime}'`;
        const data = await this._executeQueries(q);
        
        const value = data?.results[0]?.series?.[0]?.values[0][1];
        return value !== undefined ? parseFloat(value) : 0;
    }

    async getMonthlyAggregated(pmCode, year) {
        const q = `SELECT spread("kWh") FROM "power_meter" WHERE "pmCode"='${pmCode}' AND time >= '${year}-01-01T00:00:00Z' AND time <= '${year}-12-31T23:59:59Z' GROUP BY time(30d) FILL(0)`;
        const data = await this._executeQueries(q);
        
        const series = data?.results[0]?.series?.[0];
        if (!series) return new Array(12).fill(0);
        
        return series.values.map(v => parseFloat(v[1]) || 0);
    }

    async writeData(panelId, data) {
        const lp = `power_meter,pmCode=${panelId} v_avg=${data.v},i_avg=${data.i},kW=${data.kW},kWh=${data.kWh}`;
        try {
            await axios.post(`${config.url}/api/v2/write?bucket=${config.db}`, lp, {
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Accept': 'application/json'
                }
            });
        } catch (e) {
            console.error("Write Error: " + (e.response?.data || e.message));
        }
    }
}

export default new PanelRepository();