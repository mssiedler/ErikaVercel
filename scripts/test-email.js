import { loadEnv } from '../config/env.js';
import { enviarEmailNotificacao } from '../services/email.js';

loadEnv();

const to = process.argv[2] || 'fonteserika0@gmail.com';
const smtpUser = process.env.SMTP_USER || 'nao configurado';
const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const subject = `Teste de email - RO Denuncias Ambientais - ${timestamp}`;

try {
    const info = await enviarEmailNotificacao({
        to,
        subject,
        text: [
            'Teste de envio realizado pelo sistema.',
            `Conta SMTP configurada: ${smtpUser}`,
            'Senha nao incluida por seguranca.',
            `Data do teste: ${timestamp}`
        ].join('\n')
    });

    console.log(`Email de teste enviado para ${to}`);
    if (info?.messageId) {
        console.log(`Message ID: ${info.messageId}`);
    }
    console.log(`Assunto: ${subject}`);
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
