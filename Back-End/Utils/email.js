const nodemailer = require('nodemailer');

const sendEmail = async (options,res) => {
    // CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // DEFINE EMAIL OPTIONS
    const mailOptions = {
        from: 'Cineflix Support <support@cineflix.com>',
        to: options.email,
        subject: options.subject,
        text: options.text
    };

    try {
        // SEND EMAIL
        await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('There was an error sending the password reset email');
    }
};

module.exports = sendEmail;
