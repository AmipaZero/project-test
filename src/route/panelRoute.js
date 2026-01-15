import express from 'express';
import * as PanelController from '../controller/PanelController.js';

const router = express.Router();

router.get('/realtime', PanelController.getRealtime);
router.get('/status', PanelController.getStatus);
router.get('/today/:pmCode', PanelController.getTodayUsage);
router.get('/monthly/:pmCode', PanelController.getMonthlyUsage);
router.get('/total/monthly', PanelController.getTotalMonthlyUsage);

export default router;