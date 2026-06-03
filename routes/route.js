import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/imagem');
    },
    filename: function (req, file, cb) {
        const nomeArquivo = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '-');
        const nome = Date.now() + '-' + nomeArquivo;
        cb(null, nome);
    }
});

const upload = multer({ storage });
const uploadDenuncia = upload.fields([
    { name: 'evidencias', maxCount: 10 },
    { name: 'foto', maxCount: 10 }
]);

// Importando os controllers
import {
    home,
    // Time
    abreadddenuncia,
    adddenuncia,
    listardenuncia,
    filtrardenuncia,
    deletardenuncia,
    reativardenuncia,
    solicitarInativacaoDenuncia,
    abreedtdenuncia,
    edtdenuncia,
    abreverdenuncia,


    //relatorio
    listarrelatorio,
    //alertarExclusaoDenuncia,
    // // Jogador
    // abreaddjogador,
    // addjogador,
    // listarjogador,
    // filtrarjogador,
    // deletajogador,
    // abreedtjogador,
    // edtjogador,

    // Partida
    // abreaddpartida,
    // addpartida,
    // listarpartida,
    // filtrarpartida,
    // deletapartida,
    // abreedtpartida,
    // edtpartida

} from '../controllers/controller.js';
import { abreCadastroAdmin, cadastroAdmin, abreperfil, atualizarPerfil } from '../controllers/public.js';
import { marcarNotificacaoLida, marcarTodasNotificacoesLidas } from '../controllers/notificacao.js';

// ----------------------
// ROTAS

// Página inicial
router.get('/', (req, res) => res.redirect('/cadastro'));

// // ----- Denuncia -----
// router.get('/admin/denuncia/add', abreadddenuncia);
// router.post('/admin/denuncia/add', upload.single('foto'), adddenuncia);
router.get('/admin/denuncia/add2', abreadddenuncia);
router.post('/admin/denuncia/add2', uploadDenuncia, adddenuncia);
router.get('/usuario/denuncia/add', abreadddenuncia);
router.post('/usuario/denuncia/add', uploadDenuncia, adddenuncia);

router.get('/admin/denuncia/lst', listardenuncia);
router.post('/admin/denuncia/lst', filtrardenuncia);

router.get('/admin/denuncia/del/:id', deletardenuncia);
router.get('/admin/denuncia/reativar/:id', reativardenuncia);

router.get('/admin/usuarios/add', abreCadastroAdmin);
router.post('/admin/usuarios/add', cadastroAdmin);

router.get('/admin/denuncia/edt/:id', abreedtdenuncia);
router.post('/admin/denuncia/edt/:id', uploadDenuncia, edtdenuncia);
router.get('/admin/denuncia/ver/:id', abreverdenuncia);

router.get('/usuario/denuncia/lst', listardenuncia);
router.post('/usuario/denuncia/lst', filtrardenuncia);
router.get('/usuario/denuncia/ver/:id', abreverdenuncia);
router.get('/usuario/denuncia/solicitar-inativacao/:id', solicitarInativacaoDenuncia);
router.get('/usuario/perfil', abreperfil);
router.post('/usuario/perfil', atualizarPerfil);

router.get('/notificacoes/:id/ler', marcarNotificacaoLida);
router.get('/notificacoes/marcar-todas-lidas', marcarTodasNotificacoesLidas);

// ----- Relatorio -----
router.get('/admin/relatorio/lst', listarrelatorio);

// // ----- JOGADOR -----
// router.get('/admin/jogador/add', abreaddjogador);
// router.post('/admin/jogador/add', upload.single('foto'), addjogador);

// router.get('/admin/jogador/lst', listarjogador);
// router.post('/admin/jogador/lst', filtrarjogador);

// router.get('/admin/jogador/del/:id', deletajogador);

// router.get('/admin/jogador/edt/:id', abreedtjogador);
// router.post('/admin/jogador/edt/:id', upload.single('foto'), edtjogador);

// // ----- PARTIDA -----
// router.get('/admin/partida/add', abreaddpartida);
// router.post('/admin/partida/add', addpartida);

// router.get('/admin/partida/lst', listarpartida);
// router.post('/admin/partida/lst', filtrarpartida);

// router.get('/admin/partida/del/:id', deletapartida);

// router.get('/admin/partida/edt/:id', abreedtpartida);
// router.post('/admin/partida/edt/:id', edtpartida);


// Exportando
export default router;
