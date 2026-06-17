import Notificacao from '../models/notificacao.js';
import Usuario from '../models/usuarios.js';
import { enviarEmailNotificacao } from './email.js';

function normalizarTexto(valor) {
    return String(valor ?? '').trim();
}

function normalizarArquivos(arquivos) {
    return (Array.isArray(arquivos) ? arquivos : [])
        .map((arquivo) => String(arquivo))
        .sort()
        .join('|');
}

function arquivosDaDenuncia(denuncia) {
    return Array.isArray(denuncia?.evidencias) && denuncia.evidencias.length
        ? denuncia.evidencias
        : (denuncia?.foto ? [denuncia.foto] : []);
}

function escaparHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function criarHtmlEmailNotificacao(dados) {
    const titulo = escaparHtml(dados.titulo);
    const mensagem = escaparHtml(dados.mensagem);
    const numeroDenuncia = dados.ndenuncia ? `#${escaparHtml(dados.ndenuncia)}` : 'Sem numero';

    return `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${titulo}</title>
  </head>
  <body style="margin:0; padding:0; background:#f3f7f4; font-family:Arial, Helvetica, sans-serif; color:#1f2a24;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7f4; padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; background:#ffffff; border:1px solid #dce8df; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="background:#1f6f43; padding:22px 26px;">
                <div style="font-size:13px; letter-spacing:.4px; text-transform:uppercase; color:#dff4e8; font-weight:bold;">RO Denuncias Ambientais</div>
                <h1 style="margin:8px 0 0; color:#ffffff; font-size:24px; line-height:1.3;">${titulo}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px;">
                <p style="margin:0 0 18px; font-size:16px; line-height:1.6;">${mensagem}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0; border-collapse:collapse;">
                  <tr>
                    <td style="padding:14px 16px; background:#eef7f1; border:1px solid #d7e8dc; border-radius:6px;">
                      <div style="font-size:12px; color:#557062; text-transform:uppercase; font-weight:bold;">Denuncia</div>
                      <div style="font-size:20px; color:#18452b; font-weight:bold; margin-top:4px;">${numeroDenuncia}</div>
                    </td>
                  </tr>
                </table>
                <p style="margin:0; font-size:14px; line-height:1.6; color:#536158;">
                  Esta mensagem foi enviada automaticamente pelo sistema. Acompanhe a sua denuncia acessando o site.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 26px; background:#f7faf8; border-top:1px solid #e2ece5; color:#6b7b70; font-size:12px; line-height:1.5;">
                Nao responda este email. Caso precise atualizar informacoes, acesse o sistema.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function formatarDataDenuncia(data) {
    if (!data) {
        return '';
    }

    const dataObj = data instanceof Date ? data : new Date(data);
    if (Number.isNaN(dataObj.getTime())) {
        return String(data);
    }

    return dataObj.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function linhaResumo(label, valor) {
    const texto = normalizarTexto(valor);
    return texto ? `${label}: ${texto}` : null;
}

function criarResumoNovaDenuncia(denuncia) {
    return [
        linhaResumo('Numero da denuncia', denuncia.ndenuncia ? `#${denuncia.ndenuncia}` : ''),
        linhaResumo('Denunciante', denuncia.nomedenunciante),
        linhaResumo('Email', denuncia.email),
        linhaResumo('Fonte', denuncia.fonte),
        linhaResumo('Data', formatarDataDenuncia(denuncia.data)),
        linhaResumo('Hora', denuncia.hora),
        linhaResumo('Endereco', denuncia.endereco),
        linhaResumo('Especie', denuncia.especie),
        linhaResumo('Tipo de animal', denuncia.tipoAnimal),
        linhaResumo('Quantidade', denuncia.quantidade),
        linhaResumo('Situacao', denuncia.situacao),
        linhaResumo('Descricao', denuncia.descricao),
        linhaResumo('Descricao da situacao', denuncia.descricaoSituacao),
        linhaResumo('Proprietario/responsavel', denuncia.nome),
        linhaResumo('CPF', denuncia.cpf),
        linhaResumo('Telefone', denuncia.telefone),
        linhaResumo('Sigilo', denuncia.sigilo),
        linhaResumo('Endereco do proprietario', denuncia.enderecoProprietario),
        linhaResumo('Providencia', denuncia.providencia),
        linhaResumo('Arquivos enviados', arquivosDaDenuncia(denuncia).join(', '))
    ].filter(Boolean);
}

function criarHtmlEmailNovaDenunciaSite(denuncia) {
    const linhas = criarResumoNovaDenuncia(denuncia)
        .map((linha) => {
            const [label, ...valor] = linha.split(': ');
            return `
                  <tr>
                    <td style="padding:10px 12px; border-bottom:1px solid #e3ece6; color:#557062; font-weight:bold; width:190px;">${escaparHtml(label)}</td>
                    <td style="padding:10px 12px; border-bottom:1px solid #e3ece6; color:#1f2a24;">${escaparHtml(valor.join(': '))}</td>
                  </tr>`;
        })
        .join('');
    const numeroDenuncia = denuncia.ndenuncia ? `#${escaparHtml(denuncia.ndenuncia)}` : 'Sem numero';

    return `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nova denuncia recebida</title>
  </head>
  <body style="margin:0; padding:0; background:#f3f7f4; font-family:Arial, Helvetica, sans-serif; color:#1f2a24;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7f4; padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px; background:#ffffff; border:1px solid #dce8df; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="background:#1f6f43; padding:22px 26px;">
                <div style="font-size:13px; letter-spacing:.4px; text-transform:uppercase; color:#dff4e8; font-weight:bold;">RO Denuncias Ambientais</div>
                <h1 style="margin:8px 0 0; color:#ffffff; font-size:24px; line-height:1.3;">Nova denuncia recebida ${numeroDenuncia}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px;">
                <p style="margin:0 0 18px; font-size:16px; line-height:1.6;">Uma nova denuncia foi registrada pelo site.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; border:1px solid #dce8df;">
${linhas}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 26px; background:#f7faf8; border-top:1px solid #e2ece5; color:#6b7b70; font-size:12px; line-height:1.5;">
                Esta mensagem foi enviada automaticamente pelo sistema.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function enviarEmailNovaDenunciaSite(denuncia) {
    try {
        const emailSiteDenuncias = process.env.SITE_DENUNCIAS_EMAIL || 'ro.denunciasambientais@gmail.com';
        const resumo = criarResumoNovaDenuncia(denuncia);
        const info = await enviarEmailNotificacao({
            to: emailSiteDenuncias,
            subject: `Nova denúncia recebida${denuncia.ndenuncia ? ` #${denuncia.ndenuncia}` : ''}`,
            text: [
                'Nova denuncia recebida pelo site.',
                '',
                ...resumo,
                '',
                'Esta mensagem foi enviada automaticamente pelo sistema.'
            ].join('\n'),
            html: criarHtmlEmailNovaDenunciaSite(denuncia)
        });
        console.log(`Email de nova denuncia enviado para ${emailSiteDenuncias}${info?.messageId ? ` (${info.messageId})` : ''}`);
    } catch (error) {
        console.warn('Falha ao enviar email da nova denuncia para o site:', error.message || error);
    }
}

async function obterEmailCadastroUsuario(dados) {
    if (dados.usuarioId) {
        const usuario = await Usuario.findById(dados.usuarioId).select('email').lean();
        if (usuario?.email) {
            return usuario.email;
        }
    }

    if (dados.usuarioEmail) {
        const usuario = await Usuario.findOne({ email: dados.usuarioEmail }).select('email').lean();
        return usuario?.email || dados.usuarioEmail;
    }

    return null;
}

async function criarNotificacao(dados, enviarEmail = false) {
    const notificacao = await Notificacao.create(dados);

    if (enviarEmail) {
        try {
            const emailDestino = await obterEmailCadastroUsuario(dados);
            if (!emailDestino) {
                return notificacao;
            }

            const info = await enviarEmailNotificacao({
                to: emailDestino,
                subject: dados.titulo,
                text: [
                    dados.titulo,
                    '',
                    dados.mensagem,
                    '',
                    dados.ndenuncia ? `Denuncia: #${dados.ndenuncia}` : '',
                    'Esta mensagem foi enviada automaticamente pelo sistema.'
                ].filter(Boolean).join('\n'),
                html: criarHtmlEmailNotificacao(dados)
            });
            console.log(`Email de notificacao enviado para ${emailDestino}${info?.messageId ? ` (${info.messageId})` : ''}`);
        } catch (error) {
            console.warn('Falha ao enviar email de notificacao:', error.message || error);
        }
    }

    return notificacao;
}

async function buscarUsuarioDaDenuncia(denuncia) {
    if (denuncia?.usuarioId) {
        const usuario = await Usuario.findById(denuncia.usuarioId).select('_id email').lean();
        if (usuario) {
            return usuario;
        }
    }

    if (!denuncia?.email) {
        return null;
    }

    return Usuario.findOne({ email: denuncia.email }).select('_id email').lean();
}

export async function notificarAdminsNovaDenuncia(denuncia) {
    const notificacao = await criarNotificacao({
        targetRole: 'admin',
        denunciaId: denuncia._id,
        ndenuncia: denuncia.ndenuncia,
        titulo: 'Nova denúncia recebida',
        mensagem: `A denúncia nº ${denuncia.ndenuncia} foi registrada por ${denuncia.nomedenunciante || 'um cidadão'}.`,
        tipo: 'nova-denuncia',
        link: `/admin/denuncia/ver/${denuncia._id}`
    });

    await enviarEmailNovaDenunciaSite(denuncia);
    return notificacao;
}

export async function notificarUsuarioNovaDenuncia(denuncia) {
    const usuario = await buscarUsuarioDaDenuncia(denuncia);

    return criarNotificacao({
        targetRole: 'usuario',
        usuarioId: usuario?._id,
        usuarioEmail: usuario?.email || denuncia.email,
        denunciaId: denuncia._id,
        ndenuncia: denuncia.ndenuncia,
        titulo: 'Denúncia registrada',
        mensagem: `Sua denúncia nº ${denuncia.ndenuncia} foi recebida pelo sistema e está com situação ${denuncia.situacao || 'Pendente'}.`,
        tipo: 'nova-denuncia',
        link: `/usuario/denuncia/ver/${denuncia._id}`
    }, true);
}

export async function notificarUsuarioAlteracoesDenuncia(denunciaAntes, denunciaDepois) {
    const usuario = await buscarUsuarioDaDenuncia(denunciaDepois);
    const dadosBase = {
        targetRole: 'usuario',
        usuarioId: usuario?._id,
        usuarioEmail: usuario?.email || denunciaDepois.email,
        denunciaId: denunciaDepois._id,
        ndenuncia: denunciaDepois.ndenuncia,
        link: `/usuario/denuncia/ver/${denunciaDepois._id}`
    };
    const tarefas = [];

    if (normalizarTexto(denunciaAntes.situacao) !== normalizarTexto(denunciaDepois.situacao)) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Denúncia atualizada',
            mensagem: `Sua denúncia nº ${denunciaDepois.ndenuncia} teve a situação atualizada para ${denunciaDepois.situacao}.`,
            tipo: denunciaDepois.situacao === 'Resolvida' ? 'concluida' : 'situacao'
        }, true));
    }

    if (normalizarTexto(denunciaAntes.descricaoSituacao) !== normalizarTexto(denunciaDepois.descricaoSituacao)) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Detalhes da denúncia atualizados',
            mensagem: `A descrição da situação da denúncia nº ${denunciaDepois.ndenuncia} foi atualizada.`,
            tipo: 'situacao'
        }, true));
    }

    if (normalizarTexto(denunciaAntes.providencia) !== normalizarTexto(denunciaDepois.providencia)) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Andamento da denúncia',
            mensagem: `As providências da denúncia nº ${denunciaDepois.ndenuncia} foram atualizadas.`,
            tipo: 'providencia'
        }, true));
    }

    if (normalizarArquivos(arquivosDaDenuncia(denunciaAntes)) !== normalizarArquivos(arquivosDaDenuncia(denunciaDepois))) {
        tarefas.push(criarNotificacao({
            ...dadosBase,
            titulo: 'Arquivos atualizados',
            mensagem: `Os arquivos/evidências da denúncia nº ${denunciaDepois.ndenuncia} foram atualizados.`,
            tipo: 'arquivo'
        }, true));
    }

    return Promise.all(tarefas);
}

export async function carregarNotificacoesUsuarioLogado(user) {
    if (!user) {
        return { notificacoes: [], totalNaoLidas: 0 };
    }

    const filtro = user.role === 'admin'
        ? { targetRole: 'admin' }
        : {
            targetRole: 'usuario',
            $or: [
                { usuarioId: user.id },
                { usuarioEmail: user.email }
            ]
        };

    const [notificacoes, totalNaoLidas] = await Promise.all([
        Notificacao.find(filtro).sort({ createdAt: -1 }).limit(5).lean(),
        Notificacao.countDocuments({ ...filtro, lida: false })
    ]);

    return { notificacoes, totalNaoLidas };
}
