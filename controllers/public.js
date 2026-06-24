import Usuario from '../models/usuarios.js'
import Denuncia from '../models/denuncia.js'
import crypto from 'crypto'
import { enviarEmailNotificacao } from '../services/email.js'


export async function abrecadastro(req, res){
    res.render('cadastro')
}

export async function cadastro(req, res){
    //esse comando equivale a um if
    const admin = false;

    const novousuario = new Usuario({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        numero: req.body.numero || req.body.telefone,
        datanasc: req.body.datanasc || new Date(),
        admin: admin,
        superadmin: false

        
    })

    try {
        const existente = await Usuario.findOne({ email: req.body.email });
        if (existente) {
            return res.status(409).render('cadastro', { erro: 'Email já cadastrado.' });
        }

        const usuario = await novousuario.save();

        req.session.user = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            numero: usuario.numero || '',
            role: 'geral',
            superadmin: false
        };

        return res.redirect('/usuario/denuncia/lst');
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return res.status(500).render('cadastro', { erro: 'Erro ao cadastrar usuário.' });
    }
}

export async function abrelogin(req, res){
    res.render('login')
}

export async function login(req, res){
    try {
        const { nome, senha, tipo } = req.body;
        const identificador = String(nome || '').trim();
        const usuario = await Usuario.findOne({
            senha,
            $or: [
                { nome: identificador },
                { email: new RegExp(`^${escaparRegex(identificador)}$`, 'i') }
            ]
        });

        if (!usuario) {
            return res.status(401).render('login', {
                erro: 'Usuário ou senha inválidos.',
                identificador
            });
        }

        if (tipo === 'admin' && !usuario.admin && !usuario.superadmin) {
            return res.status(403).render('login', { erro: 'Usuário sem permissão de admin.' });
        }

        req.session.user = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            numero: usuario.numero || '',
            role: tipo,
            superadmin: usuario.superadmin === true
        };

        return res.redirect(tipo === 'admin' ? '/admin/denuncia/lst' : '/usuario/denuncia/lst');
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).render('login', { erro: 'Erro ao realizar login.' });
    }
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function limparTokenReset(token = '') {
    return String(token).trim().replace(/[^a-f0-9]/gi, '');
}

function escaparRegex(valor) {
    return String(valor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escaparHtml(valor = '') {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function montarUrlBase(req) {
    return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

export async function abreRecuperarSenha(req, res) {
    return res.render('recuperar-senha', { email: req.query.email || '' });
}

export async function solicitarRecuperacaoSenha(req, res) {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const usuario = await Usuario.findOne({
            email: new RegExp(`^${escaparRegex(email)}$`, 'i')
        });

        if (usuario) {
            const token = crypto.randomBytes(32).toString('hex');
            usuario.resetSenhaToken = hashToken(token);
            usuario.resetSenhaExpira = new Date(Date.now() + 60 * 60 * 1000);
            await usuario.save();

            const resetUrl = `${montarUrlBase(req)}/redefinir-senha/${token}`;
            const resetUrlHtml = escaparHtml(resetUrl);
            await enviarEmailNotificacao({
                to: usuario.email,
                subject: 'Recuperação de senha',
                text: [
                    `Olá, ${usuario.nome}.`,
                    '',
                    'Recebemos uma solicitação para recuperar sua senha.',
                    `Acesse o link abaixo para criar uma nova senha. O link expira em 1 hora:`,
                    resetUrl,
                    '',
                    'Se você não solicitou essa alteração, ignore este e-mail.'
                ].join('\n'),
                html: `
                    <p>Olá, ${escaparHtml(usuario.nome)}.</p>
                    <p>Recebemos uma solicitação para recuperar sua senha.</p>
                    <p><a href="${resetUrlHtml}">Clique aqui para criar uma nova senha</a>.</p>
                    <p>O link expira em 1 hora. Se você não solicitou essa alteração, ignore este e-mail.</p>
                `
            });
        }

        return res.render('recuperar-senha', {
            sucesso: 'Se o e-mail estiver cadastrado, enviaremos um link para recuperar a senha.'
        });
    } catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error);
        return res.status(500).render('recuperar-senha', { erro: 'Erro ao solicitar recuperação de senha.' });
    }
}

export async function abreRedefinirSenha(req, res) {
    const token = limparTokenReset(req.params.token);
    const tokenHash = hashToken(token);
    const usuario = await Usuario.findOne({
        resetSenhaToken: tokenHash,
        resetSenhaExpira: { $gt: new Date() }
    });

    if (!usuario) {
        return res.status(400).render('recuperar-senha', {
            erro: 'Link inválido ou expirado. Solicite uma nova recuperação de senha.'
        });
    }

    return res.render('redefinir-senha', { token });
}

export async function redefinirSenha(req, res) {
    try {
        const token = limparTokenReset(req.params.token);
        const { senha, confirmarSenha } = req.body;

        if (!senha || senha.length < 4) {
            return res.status(400).render('redefinir-senha', {
                token,
                erro: 'Informe uma senha com pelo menos 4 caracteres.'
            });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).render('redefinir-senha', {
                token,
                erro: 'As senhas não conferem.'
            });
        }

        const usuario = await Usuario.findOne({
            resetSenhaToken: hashToken(token),
            resetSenhaExpira: { $gt: new Date() }
        });

        if (!usuario) {
            return res.status(400).render('recuperar-senha', {
                erro: 'Link inválido ou expirado. Solicite uma nova recuperação de senha.'
            });
        }

        usuario.senha = senha;
        usuario.resetSenhaToken = undefined;
        usuario.resetSenhaExpira = undefined;
        await usuario.save();

        return res.render('login', { sucesso: 'Senha redefinida com sucesso. Faça login com sua nova senha.' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        return res.status(500).render('redefinir-senha', {
            token: limparTokenReset(req.params.token),
            erro: 'Erro ao redefinir senha.'
        });
    }
}

export async function abreperfil(req, res) {
    try {
        const usuario = await Usuario.findById(req.session.user.id);
        if (!usuario) {
            req.session.destroy(() => {});
            return res.redirect('/login');
        }

        return res.render('usuario/perfil', { usuario });
    } catch (error) {
        console.error('Erro ao abrir perfil:', error);
        return res.status(500).send('Erro ao abrir perfil.');
    }
}

export async function atualizarPerfil(req, res) {
    try {
        const { nome, email, numero } = req.body;
        const usuario = await Usuario.findById(req.session.user.id);

        if (!usuario) {
            req.session.destroy(() => {});
            return res.redirect('/login');
        }

        if (email && email !== usuario.email) {
            const existente = await Usuario.findOne({ email });
            if (existente && String(existente._id) !== String(usuario._id)) {
                return res.status(409).render('usuario/perfil', {
                    usuario,
                    erro: 'Email já cadastrado por outro usuário.'
                });
            }
        }

        const emailAnterior = usuario.email;

        usuario.nome = nome;
        usuario.email = email;
        usuario.numero = numero;
        await usuario.save();

        if (emailAnterior !== usuario.email) {
            await Denuncia.updateMany({ email: emailAnterior }, { email: usuario.email });
        }

        req.session.user.nome = usuario.nome;
        req.session.user.email = usuario.email;
        req.session.user.numero = usuario.numero || '';

        return res.render('usuario/perfil', {
            usuario,
            sucesso: 'Perfil atualizado com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).send('Erro ao atualizar perfil.');
    }
}

export async function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}

export async function abreCadastroAdmin(req, res) {
    return res.render('admin/usuarioscadastro/add');
}

export async function cadastroAdmin(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const existente = await Usuario.findOne({ email });
        if (existente) {
            return res.status(409).render('admin/usuarioscadastro/add', { erro: 'Email já cadastrado.' });
        }

        const novoAdmin = new Usuario({
            nome,
            email,
            senha,
            admin: true,
            superadmin: false
        });

        await novoAdmin.save();
        return res.redirect('/admin/denuncia/lst');
    } catch (error) {
        console.error('Erro ao cadastrar admin:', error);
        return res.status(500).render('admin/usuarioscadastro/add', { erro: 'Erro ao cadastrar admin.' });
    }
}
