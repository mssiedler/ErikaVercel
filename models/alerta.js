import conexao from '../config/conexao.js'

const Alerta = conexao.Schema({
    nomealert: { type: String, required: true }, 
    denunciaId: { type: String, required: true },
    mensagem: { type: String, required: true },
    criadoEm: { type: Date, default: Date.now }
});

export default conexao.model('Alerta', Alerta);