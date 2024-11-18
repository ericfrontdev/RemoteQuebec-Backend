import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendApplicationEmail(job, application, resumeFile) {
  const emailContent = `
Nouvelle candidature pour le poste: ${job.title}

Informations du candidat:
- Nom: ${application.fullName}
- Email: ${application.email}
- Téléphone: ${application.phone}

Lettre de motivation:
${application.coverLetter}

Un CV est joint à cet email.
`;

  try {
    const info = await transporter.sendMail({
      from: `"Remote Québec" <${process.env.SMTP_USER}>`,
      to: job.contactEmail,
      subject: `Nouvelle candidature - ${job.title}`,
      text: emailContent,
      attachments: [{
        filename: resumeFile.originalname,
        path: resumeFile.path,
      }],
    });

    console.log('Email envoyé avec succès:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du courriel:', error);
    throw new Error('Échec de l\'envoi du courriel');
  }
}