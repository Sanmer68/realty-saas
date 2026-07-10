import { Router } from 'express';
import {
  getPropiedadesPublico,
  getMisPropiedades,
  getPropiedad,
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad
} from '../controllers/propiedadController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/publico/:slug', getPropiedadesPublico);
router.get('/', protect, getMisPropiedades);
router.get('/:id', protect, getPropiedad);
router.post('/', protect, crearPropiedad);
router.put('/:id', protect, actualizarPropiedad);
router.delete('/:id', protect, eliminarPropiedad);

export default router;