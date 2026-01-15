import PanelService from '../service/PanelService.js';

export const getRealtime = async (req, res) => res.json({ status: "OK", data: await PanelService.getAllRealtime() });
export const getStatus = async (req, res) => res.json({ status: "OK", data: await PanelService.getAllStatus() });
export const getTodayUsage = async (req, res) => res.json(await PanelService.getTodayUsage(req.params.pmCode));
export const getMonthlyUsage = async (req, res) => res.json(await PanelService.getMonthlyUsage(req.params.pmCode, req.query.year));
export const getTotalMonthlyUsage = async (req, res) => res.json(await PanelService.getTotalMonthlyUsage(req.query.year));