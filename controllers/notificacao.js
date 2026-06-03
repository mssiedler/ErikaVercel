import Notificacao from '../models/notificacao.js';
import { carregarNotificacoesUsuarioLogado } from '../services/notificacoes.js';

function filtroUsuario(user) {
    if (user.role === 'admin') {
        return { targetRole: 'admin' };
    }

    return {
        targetRole: 'usuario',
        $or: [
            { usuarioId: user.id },
            { usuarioEmail: user.email }
        ]
    };
}

export async function carregarNotificacoesHeader(req, res, next) {
    res.locals.headerNotifications = [];
    res.locals.headerUnreadNotifications = 0;

    if (!req.session.user) {
        return next();
    }

    try {
        const dados = await carregarNotificacoesUsuarioLogado(req.session.user);
        res.locals.headerNotifications = dados.notificacoes;
        res.locals.headerUnreadNotifications = dados.totalNaoLidas;
    } catch (error) {
        console.error('Erro ao carregar notificacoes:', error);
    }

    next();
}

export async function marcarNotificacaoLida(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    let notificacao = null;

    try {
        notificacao = await Notificacao.findOneAndUpdate(
            { _id: req.params.id, ...filtroUsuario(req.session.user) },
            { lida: true },
            { new: true }
        );
    } catch (error) {
        console.error('Erro ao marcar notificacao como lida:', error);
    }

    res.redirect(notificacao?.link || req.get('referer') || '/');
}

export async function marcarTodasNotificacoesLidas(req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        await Notificacao.updateMany(filtroUsuario(req.session.user), { lida: true });
    } catch (error) {
        console.error('Erro ao marcar notificacoes como lidas:', error);
    }

    res.redirect(req.get('referer') || '/');
}
