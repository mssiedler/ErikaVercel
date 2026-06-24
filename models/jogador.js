import conexao from '../config/conexao.js'


const Jogador = conexao.Schema({
    nome: {
        type: String,
        required: true
    },
    altura: {
        type: Number,
        required: true
    },
    time: {
        type: conexao.Types.ObjectId, ref: "Time",
        required: false
    }
});


export default conexao.model('Jogador',Jogador)
