import express from "express";
import ProductsModel from "./model.js";
import { Op } from "sequelize";
const productRouter = express.Router();

productRouter.post("/", async (req, res, next) => {
  try {
    const product = await ProductsModel.create(req.body);
    res.send(product);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.name) query.name = { [Op.iLike]: `${req.query.name}%` };
    if (req.query.category) query.category = req.query.category;
    if (req.query.priceMin && req.query.priceMax)
      query.price = { [Op.between]: [req.query.priceMin, req.query.priceMax] };
    const products = await ProductsModel.findAll({
      where: { ...query },
      attributes: ["name", "category", "price", "id"],
    });
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByPk(req.params.productId);
    if (product) res.send(product);
  } catch (error) {
    next(error);
  }
});

productRouter.put("/:productId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ProductsModel.update(
      req.body,
      {
        where: { id: req.params.productId },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.productId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
productRouter.delete("/:productId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsModel.destroy({
      where: { id: req.params.userId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.productId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default productRouter;
