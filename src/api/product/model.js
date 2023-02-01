import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const ProductsModel = sequelize.define(
  "product",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }
  /* {timestamps: false} TIMESTAMPS HERE ARE TRUE BY DEFAULT */
);

export default ProductsModel;
