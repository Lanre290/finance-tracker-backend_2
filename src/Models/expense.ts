import { DataTypes, Model } from "sequelize";
import User from "./Users";
const sequelize = require("./../setup/Sequelize");

class Expenses extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
}

Expenses.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    group: {
        type: DataTypes.STRING,
        allowNull: false,
      },

    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date: {
        type: DataTypes.STRING,
        allowNull: false,
      },

    user_id: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: "expenses",
  }
);

// Expenses.belongsTo(User, {
//   foreignKey: 'user_id',
//   targetKey: 'id',
//   onDelete: 'CASCADE',
// });


sequelize.sync({ alter: true }).then(() => {
  console.log("Table expenses created.");
});

export default Expenses;
