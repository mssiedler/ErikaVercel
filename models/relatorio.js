import conexao from '../config/conexao.js';

const Relatorio = new conexao.Schema({
    totaldenuncias: { type: String},
    taxaresolucao: { type: String},
    statusdenuncias: { type: String },
});

export default conexao.model('Relatorio', Relatorio);
