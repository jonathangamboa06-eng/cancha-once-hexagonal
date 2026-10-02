import nodemailer from 'nodemailer';
import { adminOrderEmail, customerOrderEmail } from './templates.js';
export async function createEmailService(env){
  const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS}=env;
  if(!SMTP_HOST||!SMTP_PORT||!SMTP_USER||!SMTP_PASS){console.info('Correo desactivado: configura SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS.');return {async sendNewOrderNotifications(){return {sent:false,reason:'smtp_not_configured'};}};}
  const transporter=nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT),secure:env.SMTP_SECURE==='true',auth:{user:SMTP_USER,pass:SMTP_PASS}});
  const from=env.EMAIL_FROM||'Cancha Once <pedidos@localhost>';
  const paymentInstructions=env.PAYMENT_INSTRUCTIONS||'Contacta a la tienda para recibir las instrucciones de pago.';
  return {async sendNewOrderNotifications({order,customer,adminEmail}){
    const deliveries=[];
    if(customer.email)deliveries.push(transporter.sendMail({from,to:customer.email,...customerOrderEmail({order,customer,paymentInstructions})}));
    if(adminEmail)deliveries.push(transporter.sendMail({from,to:adminEmail,...adminOrderEmail({order,customer})}));
    if(!deliveries.length)return {sent:false,reason:'no_recipients'};
    const results=await Promise.allSettled(deliveries);const sent=results.filter(result=>result.status==='fulfilled').length;
    for(const [index,result] of results.entries()){
      if(result.status==='rejected')console.error('Entrega de correo fallida:',result.reason?.message);
      else if(SMTP_HOST==='smtp.ethereal.email'){
        const previewUrl=nodemailer.getTestMessageUrl(result.value);
        if(previewUrl)console.info(`[Ethereal] Vista previa del mensaje ${index+1}/${results.length}: ${previewUrl}`);
      }
    }
    return {sent:sent===deliveries.length,delivered:sent,attempted:deliveries.length,reason:sent===deliveries.length?undefined:'partial_delivery'};
  }};
}
