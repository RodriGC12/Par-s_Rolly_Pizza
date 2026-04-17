import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, toggleUsuarioActivo, deleteUsuario } from './usuarios.controller.js';

const router = Router();

router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.patch('/:id/toggle', toggleUsuarioActivo);
router.delete('/:id', deleteUsuario);

export default router;
