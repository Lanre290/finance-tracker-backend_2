import { Response } from "express";
import Expenses from "../Models/expense";
import { title } from "process";
import { Sequelize } from "sequelize";
import User from "../Models/Users";

interface ActionsInterface {
  addExpense: Function;
  getExpense: Function;
  getUser: Function;
}

interface afterVerificationMiddleware {
  user: { id?: number; role?: string; email?: string };
}

interface addExpenseBody {
  title: string;
  amount: number;
  group: string;
}

const Actions: ActionsInterface = {
  addExpense: async (
    req: Request & afterVerificationMiddleware,
    res: Response
  ) => {
    const user = req.user;
    const user_id = user.id;

    const { title, amount, group } = req.body as unknown as addExpenseBody;

    if (!user || !user_id)
      return res.status(401).json({ error: "Unauthorized access." });

    if (!title || !amount)
      return res
        .status(400)
        .json({ error: "Bad request.", message: "Invalid parameters." });
    const date = new Date();
    let dateString = "";
    dateString = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;

    Expenses.create({
      title: title,
      group: group,
      amount: amount,
      user_id: user_id,
      date: dateString,
    })
      .then((data) => {
        return res.status(201).json({ success: true, data: data.dataValues });
      })
      .catch(() => {
        return res.status(500).json({ error: "Server error." });
      });
  },

  getExpense: async (
    req: Request & afterVerificationMiddleware & any,
    res: Response
  ) => {
    const user = req.user;
    const user_id = user.id;
    const id = req.params.id;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Bad request.", message: "ID not provided." });
    } else {
      Expenses.findAll({
        where: { user_id: user_id },
        attributes: [
          "group",
          [Sequelize.fn("COUNT", Sequelize.col("group")), "frequency"],
        ],
        group: ["group"],
        order: [[Sequelize.literal("frequency"), "DESC"]],
      })
        .then((results) => console.log(results))
        .catch((error) => console.error(error));
    }
  },

  getUser: async (
    req: Request & afterVerificationMiddleware,
    res: Response
  ) => {
    const user = req.user;
    const user_id = user.id;
    console.log(user, user_id);

    if (!user || !user_id) {
      return res.status(401).json({ error: "Unauthorized access.", message: 'duihuieg' });
    }

    User.findOne({ where: { id: user_id }, include: [
      {
        model: Expenses,
        limit: 5,
        required: false,
        order: [["createdAt", "DESC"]],
      }
    ]})
      .then((user) => {
        Expenses.findAll({
          where: { user_id: user_id },
          attributes: [
            [Sequelize.col("group"), "id"], 
            [Sequelize.col("group"), "label"],
            [Sequelize.fn("COUNT", Sequelize.col("id")), "value"],
          ],
          group: ["group"],
          order: [[Sequelize.literal("value"), "DESC"]],
          raw: true,
        })
          .then((expenses) => {
            Expenses.findAll({where: {user_id: user_id}, order: [["createdAt", "DESC"]]}).then((newExpenses) => {
              interface userModel {
                createdAt: string;
                updatedAt: string;
              };
  
              interface adjustedUserModel {
                id: number;
                email: string;
              }
  
              let data: { user?: adjustedUserModel; expensesData?: Expenses[], expenses?: Expenses[] } = {};
              const {password, createdAt, updatedAt, ...newUser} = user?.dataValues as User & userModel;
              data.user = newUser;
              data.expensesData = expenses;
              data.expenses = newExpenses;
  
              return res.status(200).json({success: true, data: data});
            }).catch(() => {
              return res.status(500).json({error: 'Server error.'});
            }); 
          })
          .catch((error) => console.error(error));
      })
      .catch(() => {
        res.status(500).json({ error: "Server error." });
      });
  },
};

export default Actions;
