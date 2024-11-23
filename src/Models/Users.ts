import { DataTypes, Model } from "sequelize";
import Expenses from "./expense";
const sequelize = require("./../setup/Sequelize");

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "users",
  }
);


// User.hasOne(Expenses, {
//   foreignKey: 'user_id',
//   sourceKey: 'id',
//   onDelete: 'CASCADE'
// });

sequelize.sync({ alter: true }).then(() => {
  console.log("Table users created.");
});
export default User;
