import express from 'express';
const router = express.Router();
import multer from 'multer';
const upload = multer({ dest: 'public/usuarios/' })

import {
    abrecadastro,
    cadastro,
    abrelogin,
    login,
    logout,
    abreRecuperarSenha,
    solicitarRecuperacaoSenha,
    abreRedefinirSenha,
    redefinirSenha
} from '../controllers/public.js';

router.get('/cadastro', abrecadastro)
router.post('/cadastro', cadastro)

router.get('/login', abrelogin)

router.post('/login', login)

router.get('/recuperar-senha', abreRecuperarSenha)
router.post('/recuperar-senha', solicitarRecuperacaoSenha)
router.get('/redefinir-senha/:token', abreRedefinirSenha)
router.post('/redefinir-senha/:token', redefinirSenha)

router.get('/logout', logout)


export default router
