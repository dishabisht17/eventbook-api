const nodemailer =  require("nodemailer");
let transporterPromise;
const getTransporter =() =>{
    if(!transporterPromise){
        transporterPromise = (async () =>{
            if(process.env.SMTP_HOST){
                return nodemailer.createTransport({
                    host:process.env.SMTP_HOST,
                    port:Number(process.env.PORT_HOST) ||587,
                    secure:Number(process.env.PORT_HOST) === 465,
                    auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},
                })
            }
            const account = await nodemailer.createTestAccount();
            return nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port:587,
                secure:false,
                auth:{user:account.user,pass:account.pass},
            })
        })().catch((err) =>{
            transporterPromise=undefined;
            throw err;
        })
    }
    return transporterPromise;
}
const sendEmail = async({to,subject,text}) =>{
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from:process.env.EMAIL_FROM || "EventBook <no-reply@eventbook.test>",
        to,
        subject,
        text
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if(preview) console.log(`[EMAIL PREVIEW] ${preview}`);
    return info;
}
module.exports= {sendEmail};