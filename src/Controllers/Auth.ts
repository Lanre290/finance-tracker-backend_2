import User from "../Models/Users";
import { Response } from "express";
const nodemailer = require("nodemailer");
import bcrypt from "bcryptjs";
const jwt = require("jsonwebtoken");
const NodeCache = require( "node-cache" );
const otpCache = new NodeCache();
const userCache = new NodeCache();

interface Auth {
  signup: any;
  login: any;
  verifyOTP: any;
  resendOTP: any;
  forgotPassword: any;
  resetPassword: any;
}

interface signupRequest {
  fullname: string;
  email: string;
  password: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendForgotEmail = async (email: string, name: string) => {
  const frontendURL = process.env.FRONTEND_URL;
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign(
    { email: email, purpose: "reset_password" },
    secretKey,
    { expiresIn: "1h" }
  );
  console.log(
    "token: ",
    token,
    "\nsecretKey: ",
    secretKey,
    "\nfrontend url: ",
    frontendURL
  );
  try {
    console.log("fjfj");
    const mailOptions = {
      from: "Track <no-reply@Track.com>",
      to: email,
      subject: "Verify your Identity",
      html: `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Confirmation</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f9f9f9;
                      margin: 0;
                      padding: 20px;
                  }
                  .container {
                      background-color: #fff;
                      padding: 20px;
                      border-radius: 10px;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                      max-width: 600px;
                      margin: 0 auto;
                  }
                  h1 {
                      color: #333;
                      font-size: 24px;
                      margin-bottom: 10px;
                  }
                  h4 {
                      color: #555;
                      font-size: 18px;
                  }
                  .otp-code {
                      font-size: 28px;
                      font-weight: bold;
                      color: #007BFF;
                      background-color: #f0f8ff;
                      padding: 15px;
                      border-radius: 8px;
                      display: inline-block;
                      letter-spacing: 2px;
                      margin: 15px 0;
                  }
                  p {
                      color: #666;
                      font-size: 16px;
                      line-height: 1.8;
                  }
                  .footer {
                      margin-top: 30px;
                      font-size: 14px;
                      color: #999;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Hi ${
                    name.split(" ").length > 1 ? name.split(" ")[0] : name
                  }</h1>
                  <br>
                Someone just requested a link to change your password. You can do this through the link below.
                <br>
                <a href="${
                  frontendURL + "/forgotpassword/" + token
                }">Change my password</a>
                <br>
                or alternatively copy and paste this link in your browser: 
                ${frontendURL + "/resetpassword/" + token}
                <br><br>
                Please note that this link expires after an hour of receiving this mail, if you did not make this request, Please ignore this email, this link will expire once you click it.
                Your password wouldn't change until you click the link above. If you have any issues, contact us at:
                <a href="mailto:lanre2967@gmail.com" target="_blank">reachus@gmail.com</a>
              </div>
          </body>
          </html>      
    `,
    };

    transporter.sendMail(mailOptions, async (error: any, info: any) => {
      console.log("mailed");
      if (error) {
        console.log("error");
      } else {
        return true;
      }
    });
  } catch (error) {
    return "Error sending mail";
  }
};
const sendOTP = async (email: string, name: string, otp: number) => {
  try {
    const mailOptions = {
      from: "Track <no-reply@Track.com>",
      to: email,
      subject: "Verify your Identity",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Confirmation</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  margin: 0 auto;
              }
              h1 {
                  color: #333;
                  font-size: 24px;
                  margin-bottom: 10px;
              }
              h4 {
                  color: #555;
                  font-size: 18px;
              }
              .otp-code {
                  font-size: 28px;
                  font-weight: bold;
                  color: #007BFF;
                  background-color: #f0f8ff;
                  padding: 15px;
                  border-radius: 8px;
                  display: inline-block;
                  letter-spacing: 2px;
                  margin: 15px 0;
              }
              p {
                  color: #666;
                  font-size: 16px;
                  line-height: 1.8;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #999;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Hi ${
                name.split(" ").length > 1 ? name.split(" ")[0] : name
              }</h1>
              <p>We received a request to verify your email address. To complete the process, please use the OTP below:</p>
              <h4>Your One-Time Password (OTP)</h4>
              <div class="otp-code">${otp}</div>
              <p>If you didn't request this, no worries! You can safely ignore this email. Please note that this OTP expires in 5 minutes.</p>
              <p>Thanks for being part of our community! If you need any help, feel free to reach out.</p>
              <div class="footer">
                  Best regards,<br>
                  Track
              </div>
          </div>
      </body>
      </html>      
`,
    };

    transporter.sendMail(mailOptions, async (error: any, info: any) => {
      if (error) {
        console.log("error");
      } else {
        return true;
      }
    });
  } catch (error) {
    return "Error sending mail";
  }
};

const Auth: Auth = {
  signup: async (req: Request | any, res: Response) => {
    try {
      const { fullname, email, password } = req.body;

      if (
        !fullname ||
        !email ||
        !password ||
        fullname.length < 1 ||
        email.length < 1 ||
        password.length < 1
      ) {
        return res.status(400).json({ error: "Bad request." });
      } else {
        let emailExists = await User.findOne({ where: { email: email } });

        if (!emailExists) {
          let preUser = req.body;
          preUser.role = 'user';
          userCache.set(`user:${email}`, preUser, 10000 );

          const otp = Math.floor(1000 + Math.random() * 9000);
          otpCache.set(`otp:${email}`, otp, 600 );
          sendOTP(email, fullname, otp);
          return res.status(200).json({ success: true, message: 'Proceed to enter OTP.' });
        } else {
          return res.status(422).json({ error: "Email already exists." });
        }
      }
    } catch (error) {
      return res.status(500).json({ error: "Error." });
    }
  },

  verifyOTP: async (req: Request | any, res: Response) => {
    try {
      const { otp, email_ } = req.body;
      const sessionOTP = otpCache.get(`otp:${email_}`);

      if (!otp || !sessionOTP) {
        res.status(400).json({ error: "Bad request." });
      } else {
        if (otp != sessionOTP) {
          res.status(422).json({
            message: "Incorrect OTP.",
            code: "INVALID_OTP_ENTERED",
          });
        } else {
          User.findOne({where: {email: email_}}).then(async (user) => {
            if(user){
              res.status(422).json({error: 'User already exists.'});
            }
            else{
              let userInfo = userCache.get(`user:${email_}`);
              const { fullname, email, password } = userInfo;
              const SALT_ROUNDS = process.env.SALT_ROUNDS as unknown as string;
              const saltRounds: number = parseInt(SALT_ROUNDS || "10", 10);
              const enc = await bcrypt.hash(password, saltRounds);
              User.create({
                name: fullname,
                email: email,
                password: enc,
              }).then((user) => {
                if (user) {
                  const { password, ...userRef } =
                    user.dataValues;
                  const token = jwt.sign(userRef, process.env.SECRET_KEY, {
                    expiresIn: "24h",
                  });
    
                  return res.status(201).json({
                    message: "Success",
                    code: "SIGNUP_COMPLETE",
                    details: "Signup completed.",
                    token: token
                  });
                } else {
                  return res.status(500).json({
                    message: "Connection error.",
                    code: "CONNECTION_ERR",
                    details: "Error connecting to database.",
                  });
                }
              });
            }
          }).catch((err) => {
            console.log('error: ', err);
            res.status(500).json({error: 'Server error'});
          });
          
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error." });
    }
  },

  resendOTP: async (req: Request | any, res: Response) => {
    try {
      const { email_ } = req.body;
      if(!email_){
        return res.status(400).json({error: 'Bad request.'});
      }
      const user = userCache.get(`user:${email_}`)
      if (!user) {
        res.status(404).json({ error: "No login process found." });
      } else {
        let { email, name } = user;
        const otp = Math.floor(1000 + Math.random() * 9000);
        otpCache.set(`otp:${email}`, '', 1 );
        otpCache.set(`otp:${email}`, otp, 600 );

        sendOTP(email, name, otp);
      }
    } catch (error) {
      return res.status(500).json({ error: "Server error." });
    }
  },

  login: async (req: Request | any, res: Response) => {
    try {
      let { email, password } = req.body;

      if (!email || !password || email.length < 1 || password.length < 1) {
        return res.status(400).json({ error: "Bad request." });
      } else {
        let user = await User.findOne({ where: { email: email } });

        if (!user) {
          res.status(404).json({ error: "Invalid credentials." });
        } else {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            const { password, createdAt, updatedAt, ...userRef } =
              user.dataValues;
            const token = jwt.sign(userRef, process.env.SECRET_KEY, {
              expiresIn: "24h",
            });
            return res
              .status(200)
              .json({ success: true, token: token, user: userRef });
          } else {
            return res
              .status(404)
              .json({ success: false, error: "Invalid credentials." });
          }
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
  forgotPassword: async (req: Request, res: Response) => {
    try {
      interface forgotEmailInterface {
        email: string;
      }
      let { email } = req.body as unknown as forgotEmailInterface;

      if (!email) {
        res.status(400).json({ error: "Bad request." });
      } else {
        let user = await User.findOne({ where: { email: email } });
        if (!user) {
          res.status(404).json({ error: "Invalid email." });
        } else {
          interface user {
            username: string;
          }

          const { username } = (await User.findOne({
            where: { email: email },
          })) as unknown as user;
          let mail = await sendForgotEmail(email, username);
          if (mail) {
            res.status(200).json({ sucess: true });
          } else {
            res
              .status(500)
              .json({ error: "We are unable to send mail at this time. 😔" });
          }
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
  resetPassword: async (req: Request, res: Response) => {
    try {
      try {
        interface resetPasswordInterface {
          token: string;
          password: string;
        }
        const { token, password } =
          req.body as unknown as resetPasswordInterface;
        const secretKey = process.env.SECRET_KEY;

        const decoded = jwt.verify(token, secretKey);
        if (!decoded.purpose || !decoded.email) {
          throw new Error("Invalid token");
        }

        if (decoded.purpose !== "reset_password") {
          throw new Error("Invalid token.");
        }

        const email = decoded.email;
        const SALT_ROUNDS = process.env.SALT_ROUNDS as unknown as string;
        const saltRounds: number = parseInt(SALT_ROUNDS || "10", 10);
        const enc = await bcrypt.hash(password, saltRounds);

        const update = User.update(
          { password: enc },
          { where: { email: email } }
        ).then((user) => {
          if (user) {
            res
              .status(200)
              .json({ success: true, message: "Password changed." });
          } else {
            res.status(500).json({ error: "Server error." });
          }
        });
      } catch (err) {
        res.status(422).json({ error: err });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },
};

export default Auth;
