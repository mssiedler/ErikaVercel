import conexao from '../config/conexao.js'

const Denuncia = conexao.Schema({
    usuarioId: {type: conexao.Schema.Types.ObjectId, ref: 'Usuario', required: false},
    ndenuncia : {type:Number, required:true},
    nomedenunciante:{type:String, required:true},
    email:{type:String, required:true},
    fonte: {type:String, required:true},
    data : {type:Date, required:true},
    hora : {type: String, required:true},

    //2. dados da denuncia
    endereco:{type:String},
    especie:{type:String},
    quantidade:{type:Number},
    situacao:{type:String, required:true},
    descricaoSituacao:{type:String},
    descricao:{type:String},
    evidencias:{type:[String], default:[]},
     foto: { type: String, required: false },

    //3,dados do proprietário
    nome:{type:String},
    cpf:{type:String},
    telefone:{type:String}, 
    sigilo:{type:String},
    enderecoProprietario:{type:String},

    //4. providencias tomadas
    providencia:{type:String}
});

export default conexao.model('Denuncia',Denuncia)
