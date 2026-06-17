import Denuncia from '../models/denuncia.js';
import Alerta from '../models/alerta.js';
import Relatorio from '../models/relatorio.js';
import { notificarAdminsNovaDenuncia, notificarUsuarioAlteracoesDenuncia, notificarUsuarioNovaDenuncia } from '../services/notificacoes.js';
// import Jogador from '../models/jogador.js';
// import Partida from '../models/partida.js';

export const home = async (req, res) => {
   
  
    res.render("admin/index");
  };

export async function abreadddenuncia(req, res) {
    const isAdmin = req.originalUrl.startsWith('/admin');
    const tipoDenuncia = ['animais', 'ambiental'].includes(req.query.tipo) ? req.query.tipo : null;
    res.render('admin/denuncia/add2', { isAdmin, tipoDenuncia })
}

async function gerarNumeroDenuncia() {
    const ultimaDenuncia = await Denuncia
        .findOne({ ndenuncia: { $ne: null } })
        .sort({ ndenuncia: -1 })
        .select('ndenuncia')
        .lean();

    return Number(ultimaDenuncia?.ndenuncia || 0) + 1;
}

function obterArquivosUpload(req) {
    return Array.isArray(req.files)
        ? req.files.map((file) => file.filename)
        : [
            ...(req.files?.evidencias || []),
            ...(req.files?.foto || [])
        ].map((file) => file.filename);
}

function obterPrimeiraImagem(arquivos) {
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp'];

    return arquivos.find((arquivo) => {
        const arquivoLower = String(arquivo).toLowerCase();
        return extensoesImagem.some((extensao) => arquivoLower.endsWith(extensao));
    }) || null;
}

export async function adddenuncia(req, res) {
    const arquivosUpload = obterArquivosUpload(req);
    const fotoupload = obterPrimeiraImagem(arquivosUpload) || (req.file ? req.file.filename : null);
    const isUser = req.originalUrl.startsWith('/usuario');
    const situacao = isUser ? 'Pendente' : req.body.situacao;
    const emailDenunciante = isUser && req.session.user?.email ? req.session.user.email : req.body.email;
    const ndenuncia = await gerarNumeroDenuncia();

    const denunciaCriada = await Denuncia.create({
        usuarioId: isUser ? req.session.user?.id : undefined,
        ndenuncia,
        nomedenunciante: req.body.nomeDenunciante,
        email: emailDenunciante,
        fonte: req.body.fonte || 'Site',
        data: req.body.data,
        hora: req.body.hora,
        endereco: req.body.endereco,
        especie: req.body.especie,
        tipoAnimal: req.body.tipoAnimal,
        quantidade: req.body.quantidade,
        situacao,
        descricaoSituacao: req.body.descricaoSituacao,
        descricao: req.body.descricao,
        foto: fotoupload,
        evidencias: arquivosUpload,
        nome: req.body.nome,
        cpf: req.body.cpf,
        telefone: req.body.telefone,
        sigilo: req.body.sigilo,
        enderecoProprietario: req.body.enderecoProprietario,
        providencia: req.body.providencia
    });
    if (isUser) {
        await Promise.all([
            notificarAdminsNovaDenuncia(denunciaCriada),
            notificarUsuarioNovaDenuncia(denunciaCriada)
        ]);
        return res.redirect('/usuario/denuncia/lst');
    }

    res.redirect('/admin/denuncia/lst');
}
export async function listardenuncia(req, res) {
    const isUser = req.originalUrl.startsWith('/usuario');
    if (isUser) {
        const emailUsuario = req.session.user?.email;
        const resultado = emailUsuario
            ? await Denuncia.find({ email: emailUsuario }).catch(function(err){console.log(err)})
            : [];
        const DenunciasView = (resultado || []).map((denuncia) => ({
            id: denuncia._id,
            ndenuncia: denuncia.ndenuncia ?? '',
            nomeDenunciante: denuncia.nomedenunciante ?? '',
            cpf: denuncia.cpf ?? '',
            email: denuncia.email ?? '',
            fonte: denuncia.fonte ?? '',
            data: denuncia.data ?? '',
            hora: denuncia.hora ?? '',
            endereco: denuncia.endereco ?? '',
            especie: denuncia.especie ?? '',
            tipoAnimal: denuncia.tipoAnimal ?? '',
            quantidade: denuncia.quantidade ?? '',
            situacao: denuncia.situacao ?? '',
            descricaoSituacao: denuncia.descricaoSituacao ?? '',
            descricao: denuncia.descricao ?? '',
            nome: denuncia.nome ?? '',
            enderecoProprietario: denuncia.enderecoProprietario ?? '',
            providencia: denuncia.providencia ?? ''
        }));
        return res.render('usuario/denuncia/lst', { DenunciasView });
    }

    const resultado = await Denuncia.find({}).catch(function(err){console.log(err)});
    const DenunciasView = (resultado || []).map((denuncia) => ({
        id: denuncia._id,
        ndenuncia: denuncia.ndenuncia ?? '',
        nomeDenunciante: denuncia.nomedenunciante ?? '',
        cpf: denuncia.cpf ?? '',
        email: denuncia.email ?? '',
        fonte: denuncia.fonte ?? '',
        data: denuncia.data ?? '',
        hora: denuncia.hora ?? '',
        endereco: denuncia.endereco ?? '',
        especie: denuncia.especie ?? '',
        tipoAnimal: denuncia.tipoAnimal ?? '',
        quantidade: denuncia.quantidade ?? '',
        situacao: denuncia.situacao ?? '',
        descricaoSituacao: denuncia.descricaoSituacao ?? '',
        descricao: denuncia.descricao ?? '',
        nome: denuncia.nome ?? '',
        enderecoProprietario: denuncia.enderecoProprietario ?? '',
        providencia: denuncia.providencia ?? ''
    }));
    res.render('admin/denuncia/lst',{DenunciasView});
}
export async function filtrardenuncia(req, res) {
    const isUser = req.originalUrl.startsWith('/usuario');
    const pesquisar = req.body.pesquisar || '';
    const filtro = { nome: new RegExp(pesquisar, "i") };

    if (isUser) {
        const emailUsuario = req.session.user?.email;
        if (!emailUsuario) {
            return res.render('usuario/denuncia/lst', { DenunciasView: [] });
        }
        filtro.email = emailUsuario;
    }

    const resposta = await Denuncia.find(filtro);
    const DenunciasView = (resposta || []).map((denuncia) => ({
        id: denuncia._id,
        ndenuncia: denuncia.ndenuncia ?? '',
        nomeDenunciante: denuncia.nomedenunciante ?? '',
        cpf: denuncia.cpf ?? '',
        email: denuncia.email ?? '',
        fonte: denuncia.fonte ?? '',
        data: denuncia.data ?? '',
        hora: denuncia.hora ?? '',
        endereco: denuncia.endereco ?? '',
        especie: denuncia.especie ?? '',
        tipoAnimal: denuncia.tipoAnimal ?? '',
        quantidade: denuncia.quantidade ?? '',
        situacao: denuncia.situacao ?? '',
        descricaoSituacao: denuncia.descricaoSituacao ?? '',
        descricao: denuncia.descricao ?? '',
        nome: denuncia.nome ?? '',
        enderecoProprietario: denuncia.enderecoProprietario ?? '',
        providencia: denuncia.providencia ?? ''
    }));

    res.render(isUser ? 'usuario/denuncia/lst' : 'admin/denuncia/lst', { DenunciasView });
}

export async function deletardenuncia(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send('ID da denúncia é obrigatório.');
    }

    try {
        const denunciaAntes = await Denuncia.findById(id);
        const denuncia = await Denuncia.findByIdAndUpdate(
            id,
            { situacao: 'Inativa' },
            { new: true }
        );

        if (!denuncia) {
            return res.status(404).send('Denúncia não encontrada.');
        }

        if (denunciaAntes) {
            await notificarUsuarioAlteracoesDenuncia(denunciaAntes, denuncia);
        }

        const back = req.get('referer');
        res.redirect(back || '/admin/denuncia/lst');
    } catch (error) {
        console.error('Erro ao inativar denúncia (admin):', error);
        res.status(500).send('Erro ao inativar denúncia.');
    }
}

export async function reativardenuncia(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send('ID da denúncia é obrigatório.');
    }

    try {
        const denunciaAntes = await Denuncia.findById(id);
        const denuncia = await Denuncia.findByIdAndUpdate(
            id,
            { situacao: 'Pendente' },
            { new: true }
        );

        if (!denuncia) {
            return res.status(404).send('Denúncia não encontrada.');
        }

        if (denunciaAntes) {
            await notificarUsuarioAlteracoesDenuncia(denunciaAntes, denuncia);
        }

        res.redirect('/admin/denuncia/lst');
    } catch (error) {
        console.error('Erro ao reativar denúncia (admin):', error);
        res.status(500).send('Erro ao reativar denúncia.');
    }
}
export async function abreedtdenuncia(req, res){
    const resultado = await Denuncia.findById(req.params.id)
    res.render('admin/denuncia/ver',{Denuncia: resultado, isAdmin: true})
}
export async function abreverdenuncia(req, res){
    const resultado = await Denuncia.findById(req.params.id)
    const isAdmin = req.originalUrl.startsWith('/admin');
    res.render('admin/denuncia/ver',{Denuncia: resultado, isAdmin})
}

export async function solicitarInativacaoDenuncia(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send('ID da denúncia é obrigatório.');
    }

    try {
        const denuncia = await Denuncia.findById(id);

        if (!denuncia) {
            return res.status(404).send('Denúncia não encontrada.');
        }

        const dataFormatada = denuncia.data
            ? new Date(denuncia.data).toLocaleDateString('pt-BR')
            : '';
        const horaFormatada = denuncia.hora || '';
        const dataHora = dataFormatada && horaFormatada
            ? `${dataFormatada} ${horaFormatada}`
            : dataFormatada || horaFormatada || '';
        const mensagem = [
            'PEDIDO DE INATIVACAO DE DENUNCIA',
            `Denuncia: ${denuncia.ndenuncia ?? ''}`,
            `Data/hora: ${dataHora}`,
            `Denunciante: ${denuncia.nomedenunciante ?? ''}`,
            `Situacao: ${denuncia.situacao ?? ''}`,
            `Id: ${denuncia._id ?? ''}`
        ].join('\n');
        await Alerta.create({
            nomealert: 'SOLICITACAO INATIVACAO',
            denunciaId: String(denuncia._id),
            mensagem
        });

        res.redirect('/usuario/denuncia/lst');
    } catch (error) {
        console.error('Erro ao solicitar inativação (usuário):', error);
        res.status(500).send('Erro ao solicitar inativação.');
    }
}
export async function edtdenuncia(req, res) {
  try {
    const denunciaAtual = await Denuncia.findById(req.params.id);

    if (!denunciaAtual) {
      return res.status(404).send('Denúncia não encontrada.');
    }

    const manterEvidencias = req.body.manterEvidencias
      ? (Array.isArray(req.body.manterEvidencias) ? req.body.manterEvidencias : [req.body.manterEvidencias])
      : [];
    const evidenciasAtuais = Array.isArray(denunciaAtual.evidencias) && denunciaAtual.evidencias.length
      ? denunciaAtual.evidencias
      : (denunciaAtual.foto ? [denunciaAtual.foto] : []);
    const arquivosUpload = obterArquivosUpload(req);
    const evidencias = [
      ...evidenciasAtuais.filter((arquivo) => manterEvidencias.includes(arquivo)),
      ...arquivosUpload
    ];

    const updateData = {
      situacao: req.body.situacao,
      descricaoSituacao: req.body.descricaoSituacao,
      providencia: req.body.providencia,
      evidencias,
      foto: obterPrimeiraImagem(evidencias)
    };

    const denunciaAtualizada = await Denuncia.findByIdAndUpdate(req.params.id, updateData, { new: true });

    await notificarUsuarioAlteracoesDenuncia(denunciaAtual, denunciaAtualizada);

    res.redirect('/admin/denuncia/lst');
  } catch (error) {
    console.error('Erro ao atualizar denuncia:', error);
    res.status(500).send('Erro ao atualizar denuncia');
  }
}



export async function listarrelatorio(req, res) {
    try {
        // denúncias para cards e gráficos 
        const denuncias = await Denuncia.find({});
        const totalDenuncias = denuncias.length;
        const totalResolvidas = denuncias.filter((denuncia) => denuncia.situacao === 'Resolvida').length;
        const totalPendentes = denuncias.filter((denuncia) => denuncia.situacao === 'Pendente').length;
        // denúncias p status  o gráfico de pizza
        const statusLabels = ['Pendente', 'Em Análise', 'Em Andamento', 'Resolvida', 'Arquivada'];
        const statusCounts = statusLabels.map((status) =>
            denuncias.filter((denuncia) => denuncia.situacao === status).length
        );
        // denúncias animais e ambientais
        const totalAnimais = denuncias.filter((denuncia) => denuncia.especie === 'Animais').length;
        const totalAmbiental = denuncias.filter((denuncia) => denuncia.especie === 'Ambiental').length;
        // porcentagem para  barras
        const percentualAnimais = totalDenuncias > 0
            ? ((totalAnimais / totalDenuncias) * 100).toFixed(1)
            : '0.0';
        const percentualAmbiental = totalDenuncias > 0
            ? ((totalAmbiental / totalDenuncias) * 100).toFixed(1)
            : '0.0';
        // taxa de resolução 
        const taxaResolucao = totalDenuncias > 0
            ? ((totalResolvidas / totalDenuncias) * 100).toFixed(1)
            : '0.0';

        res.render('admin/relatorio/lst', {
            totalDenuncias,
            totalResolvidas,
            totalPendentes,
            taxaResolucao,
            statusLabels,
            statusCounts,

            
            totalAnimais,
            totalAmbiental,
            percentualAnimais,
            percentualAmbiental
        });
    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        res.status(500).send('Erro ao carregar relatório');
    }
}

// export async function alertarExclusaoDenuncia(req, res) {
//     const { id } = req.params;

//     await Alerta.create({
//         nomealert: 'EXCLUSAO DA DENúNCIA',
//         denunciaId: id,
//         mensagem: `Tentativa de exclusão da denúncia ${id}`
//     });

//     // bloqueia a exclusão
//       res.status(500).send('Erro ao excluir. Alerta registrado.');
//     // res.status(403).send('Exclusão bloqueada. Alerta registrado.');
// }


/*
          funccion para desfazier cagadióis 

const partidas = await Partida.find().populate('timedecasa timedefora')
const ruins = partidas.filter(p => !p.timedecasa || !p.timedefora)
await Partida.deleteMany({_id: { $in: ruins.map(p => p._id)}})

*/
