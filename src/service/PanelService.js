import PanelRepository from '../repository/PanelRepository.js';
import mqttConfig from '../config/mqtt.js';
import moment from 'moment';

class PanelService {
    async getAllRealtime() {
        const ids = ["PANEL_LANTAI_1", "PANEL_LANTAI_2", "PANEL_LANTAI_3"];
        const data = await Promise.all(ids.map(id => PanelRepository.getLatestData(id)));
        return data.filter(d => d !== null);
    }

    async getAllStatus() {
        const ids = ["PANEL_LANTAI_1", "PANEL_LANTAI_2", "PANEL_LANTAI_3"];
        const latests = await this.getAllRealtime();
        const now = Math.floor(Date.now() / 1000);
        return ids.map(id => {
            const found = latests.find(l => l.pmCode === id);
            return { pmCode: id, status: (found && (now - found.time < 300)) ? "ONLINE" : "OFFLINE" };
        });
    }

    async getTodayUsage(pmCode) {
        const latest = await PanelRepository.getLatestData(pmCode);
        const first = await PanelRepository.getFirstKwhToday(pmCode);
        const energy = Math.max(0, (parseFloat(latest?.kWh) || 0) - (parseFloat(first) || 0));
        return {
            status: "OK",
            data: {
                pmCode,
                year: moment().format('YYYY'),
                month: moment().format('MM'),
                date: [moment().format('YYYY-MM-DD')],
                energy: [energy.toFixed(2)],
                cost: [Math.round(energy * mqttConfig.kwhRate)]
            }
        };
    }

    async getMonthlyUsage(pmCode, year) {
        const energies = await PanelRepository.getMonthlyAggregated(pmCode, year);
        const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        return {
            status: "OK",
            data: {
                pmCode, year, month: moment().format('MM'),
                date: months,
                energy: energies.map(e => e.toFixed(2)),
                cost: energies.map(e => Math.round(e * mqttConfig.kwhRate))
            }
        };
    }

    async getTotalMonthlyUsage(year) {
        const ids = ["PANEL_LANTAI_1", "PANEL_LANTAI_2", "PANEL_LANTAI_3"];
        const all = await Promise.all(ids.map(id => PanelRepository.getMonthlyAggregated(id, year)));
        const totalEnergy = new Array(12).fill(0);
        all.forEach(p => p.forEach((v, i) => totalEnergy[i] += v));
        return {
            status: "OK",
            data: {
                pmCode: "TOTAL_GEDUNG", year,
                energy: totalEnergy.map(e => e.toFixed(2)),
                cost: totalEnergy.map(e => Math.round(e * mqttConfig.kwhRate))
            }
        };
    }
}

export default new PanelService();