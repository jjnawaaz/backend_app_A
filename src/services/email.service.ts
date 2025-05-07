import nodemailer from 'nodemailer';
import logger from '../utils/logger.utils';
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function sendVerificationEmail(email: string, token: string) {
    try {
        const verificationUrl = `${process.env.BASE_URL}/api/users/verify-email/${token}`;
        console.log("In mail")
        transporter.sendMail({
            from: `Welcome to the Page`,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
            `
        },(error,info)=>{
            if(error){
                console.log(error)
            }
            console.log(info)
        });
        
        logger.info(`Verification email sent to ${email}`);
    } catch (err) {
        logger.error('Error sending verification email:', err);
        throw err;
    }
}