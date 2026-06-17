import express from 'express'
import { loadEnv } from './config/env.js'

loadEnv();

const app = express();

import session from 'express-session'

app.use(express.urlencoded({extended:true}))
app.set('view engine', 'ejs')
app.use(session({
    secret: 'denuncias-secret',
    resave: false,
    saveUninitialized: false
}))

//liberar acesso a pasta public
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import mongoose from 'mongoose'
const url = 'mongodb+srv://aluno:aluno@cluster0.diho964.mongodb.net/?appName=Cluster0'


//converte o camimnho do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(__dirname + '/public'));

import routes from "./routes/route.js"
import publicRoutes from "./routes/routP.js"
import { carregarNotificacoesHeader } from "./controllers/notificacao.js"
/*
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    const path = req.path;
    const isPublic = path.startsWith('/login') || path.startsWith('/cadastro') || path.startsWith('/recuperar-senha') || path.startsWith('/redefinir-senha');
    if (!req.session.user && (path.startsWith('/admin') || path.startsWith('/usuario') || path.startsWith('/notificacoes')) && !isPublic) {
        return res.redirect('/login');
    }
    if (path.startsWith('/admin/usuarios') && (!req.session.user || req.session.user.superadmin !== true)) {
        return res.redirect('/admin/denuncia/lst');
    }
    if (req.session.user && path.startsWith('/admin') && req.session.user.role !== 'admin') {
        return res.redirect('/usuario/denuncia/lst');
    }
    if (req.session.user && path.startsWith('/usuario') && req.session.user.role !== 'geral') {
        return res.redirect('/admin/denuncia/lst');
    }
    next();
});
*/

app.use(carregarNotificacoesHeader);
app.use(publicRoutes)
app.use(routes)

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
})
