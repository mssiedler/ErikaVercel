import conexao from '../config/conexao.js';

const Notificacao = conexao.Schema({
    usuarioId: { type: conexao.Schema.Types.ObjectId, ref: 'Usuario', required: false },
    usuarioEmail: { type: String, required: false },
    targetRole: { type: String, enum: ['usuario', 'admin'], required: true },
    denunciaId: { type: conexao.Schema.Types.ObjectId, ref: 'Denuncia', required: false },
    ndenuncia: { type: Number, required: false },
    titulo: { type: String, required: true },
    mensagem: { type: String, required: true },
    tipo: { type: String, default: 'info' },
    link: { type: String, required: false },
    lida: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default conexao.model('Notificacao', Notificacao);
