import mongoose from 'mongoose';

const url = "mongodb+srv://aluno:aluno@cluster0.diho964.mongodb.net/?appName=Cluster0"

const conexao = await mongoose.connect(url)
export default mongoose