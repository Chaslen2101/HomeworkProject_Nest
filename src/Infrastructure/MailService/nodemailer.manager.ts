// import nodemailer from 'nodemailer';
//
// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
// const transporter = nodemailer.createTransport({
//   host: 'smtp.sendgrid.net',
//   port: 587,
//   secure: false,
//   auth: {
//     // user: process.env.SENDGREED_USERNAME,
//     // pass: process.env.SENDGREED_PASSWORD,
//   },
// });
//
// // const transporter = nodemailer.createTransport({
// //     service: "gmail",
// //     auth:{
// //         user: "chaslen2101.itincubator@gmail.com",
// //         pass:
// //     }
// // })
//
// export const nodemailerManager = {
//   async sendEmail(emailAddress: string, subject: string, text: string) {
//     await transporter.sendMail({
//       from: '"Chaslen2101" <Chaslen2101.itincubator@gmail.com>',
//       to: emailAddress,
//       subject: subject,
//       html: `<h1>Password recovery</h1>
//             <p>To finish password recovery please follow the link below:
//             <a href=${text}>recovery password</a></p>`,
//     });
//     return;
//   },
// };
