import { Router } from 'express';
import {
  crearLeadPublico,
  getMisLeads,
  getLead,
  actualizarLead,
  getStats
} from '../controllers/leadController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/publico/:slug', crearLeadPublico);
router.get('/stats', protect, getStats);
router.get('/', protect, getMisLeads);
router.get('/:id', protect, getLead);
router.put('/:id', protect, actualizarLead);

export default router;