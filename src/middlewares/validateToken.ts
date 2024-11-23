import { NextFunction, Response } from "express";
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

let middlewares = {
  authenticateToken: (
    req: Request | any,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const preToken = req.headers.authorization as string;
      if (preToken == undefined) {
        res.status(401).json({ error: "Unauthorized access." });
      } else {
        const token = preToken.split(" ")[1];

        if (!token) {
          res
            .status(401)
            .json({ sucess: false, error: "Unauthorized access." });
        }

        jwt.verify(token, secretKey, (err: any, decoded: any) => {
          if (err) {
            res.status(401).json({ sucess: false, error: "Error." });
          } else {
            if (!decoded) {
              res.status(401).json({ error: "Unauthorized access." });
            } else {
              req.user = decoded;
              next();
            }
          }
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  },

  
};

export default middlewares;
