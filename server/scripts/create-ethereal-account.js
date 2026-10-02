import nodemailer from 'nodemailer';
const account=await nodemailer.createTestAccount();
console.log('Copia estos valores a server/.env (cuenta de pruebas Ethereal):');
console.log(`SMTP_HOST=smtp.ethereal.email\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER=${account.user}\nSMTP_PASS=${account.pass}\nEMAIL_FROM=Cancha Once <${account.user}>`);
console.log(`Bandeja de pruebas: ${account.web}`);
