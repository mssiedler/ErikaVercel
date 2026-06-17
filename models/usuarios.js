import conexao from '../config/conexao.js'

const Usuario = conexao.Schema({
    nome: {type:String, required:true},
    numero: {type:String, required:false},
    email: {type:String, required:true},
    senha: {type:String, required:true},
    datanasc:{type: Date, required:false},
    admin: {type: Boolean, default: false},
    superadmin: {type: Boolean, default: false},
    resetSenhaToken: {type:String, required:false},
    resetSenhaExpira: {type:Date, required:false}
})

export default conexao.model('Usuario',Usuario)
