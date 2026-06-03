let nodemailerModule = null;

async function getMailer() {
    if (nodemailerModule) {
        return nodemailerModule;
    }

    try {
        nodemailerModule = await import('nodemailer');
        return nodemailerModule;
    } catch (error) {
        console.warn('Nodemailer nao instalado. Email nao enviado:', error.message);
        return null;
    }
}

export async function enviarEmailNotificacao({ to, subject, text, html }) {
    if (!to || process.env.EMAIL_ENABLED === 'false') {
        return;
    }

    const mailer = await getMailer();
    if (!mailer) {
        return;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !user || !pass || !from) {
        console.warn('Configuracao SMTP incompleta. Email nao enviado.');
        return;
    }

    const transporter = mailer.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });

    try {
        return await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html
        });
    } catch (error) {
        if (error?.code === 'EAUTH') {
            throw new Error('Falha na autenticacao SMTP. No Gmail, use uma senha de app em SMTP_PASS.');
        }

        throw error;
    }
}
