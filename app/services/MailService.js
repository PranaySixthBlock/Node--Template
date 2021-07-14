"use strict";
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const {to,TE} = require('../middlewares/utilservices');
let path = require('path');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SG_KEY);

// create reusable transporter object using the default SMTP transport
const mailer= nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: 'gmail',
    // secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // SMTP GMail Acc Email Username
      pass: process.env.EMAIL_PASSWORD // SMTP GMail Acc Email pwd
    }
});

module.exports={
 sendEmail: async function(template, emailPayload){
    let err, emailInfo;
    const handlebarOptions = {
            viewEngine: {
            extName: '.hbs',
            partialsDir: path.join(__basepath, 'views/email'),
            layoutsDir: path.join(__basepath, 'views/email'),
            defaultLayout: "",
            },
            viewPath: path.join(__basepath, 'views/email'),
            extName: '.hbs',
        };
    mailer.use('compile',hbs(handlebarOptions));

     // setup email data with unicode symbols
    let mailOptions = {
        from: emailPayload.mail_from ? emailPayload.mail_from : process.env.EMAIL_FROM, // sender address
        to: emailPayload.users, // list of receivers
        replyTo : emailPayload.mail_from ? emailPayload.mail_from : process.env.EMAIL_REPLYTO,
        cc : emailPayload.mail_cc || process.env.EMAIL_CC,
        subject: emailPayload.sub, // Subject line
        template: template,
        context:emailPayload.context_obj
    };
    // send mail with defined transport object
    [err, emailInfo] = await to(mailer.sendMail(mailOptions));
    if(err){
        console.log(err);
        TE(err.message);
    }
    if(emailInfo){
        console.log("Success");
        
        return emailInfo;
    }
 },

 sgSurveyMailService2:async function(payload) {
    const msg = {
        to: [payload.email],
        from: process.env.EMAIL_FROM,
        cc: payload.mail_cc ? payload.mail_cc : process.env.EMAIL_CC,
        replyTo: process.env.EMAIL_REPLYTO,
        templateId: payload.sgTemplate,
        dynamic_template_data: payload.emailBody,
    };
    
    let error, content;

    [error, content] = await to(sgMail.send(msg));

    if(error) {
        TE(error.message, true);
    }
    if(content){
        console.log("Email sent successfully!");
        return content;
    }
},
};