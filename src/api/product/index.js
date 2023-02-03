import express from "express";
import ProductsModel from "./model.js";
import { Op } from "sequelize";
import ReviewsModel from "../reviews/model.js";
import CategoriesModel from "../categories/model.js";
import ProductsCatModel from "../product/ProductsCatModel.js";
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

productRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { author, text, rating } = req.body;
    const reviews = await ReviewsModel.create({
      productId,
      author,
      text,
      rating,
    });
    res.status(201).send(reviews);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewsModel.findAll({ where: { productId } });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

productRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const numberOfDeletedRows = await ReviewsModel.destroy({
        where: { id: reviewId },
      });
      if (numberOfDeletedRows === 1) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `Review with  ${reviewId} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

productRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.name) query.name = { [Op.iLike]: `${req.query.name}%` };
    if (req.query.brand) query.brand = { [Op.iLike]: `${req.query.brand}%` };
    if (req.query.priceMin && req.query.priceMax)
      query.price = { [Op.between]: [req.query.priceMin, req.query.priceMax] };

    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;

    let products = await ProductsModel.findAll({
      where: { ...query },
      attributes: ["id", "name", "catgory", "price", "image"],
      include: [
        {
          model: CategoriesModel,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset: skip,
    });

    if (req.query.category) {
      const category = await CategoriesModel.findOne({
        where: { name: req.query.category },
      });
      if (category) {
        products = products.filter((product) => {
          return product.categories.some((prodCategory) => {
            return prodCategory.name === req.query.category;
          });
        });
      }
    }

    res.send(products);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/", async (req, res, next) => {
  try {
    const { id } = await ProductsModel.create(req.body);
    if (req.body.categoryId) {
      await ProductsCategoriesModel.create({
        categoryId: req.body.categoryId,
        productId: id,
      });
    }
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

productRouter.post("/:productId/:categoryId", async (req, res, next) => {
  try {
    await ProductsCatModel.create({
      categoryId: req.params.categoryId,
      productId: req.params.productId,
    });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

productRouter.delete("/:productId/:categoryId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsCatModel.destroy({
      where: {
        productId: req.params.productId,
        categoryId: req.params.categoryId,
      },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Association between product with id ${req.params.productId} and category with id ${req.params.categoryId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// MANY TO MANY RELATIONSHIP

ProductsModel.belongsToMany(CategoriesModel, {
  through: ProductsCatModel,
  foreignKey: { name: "productId", allowNull: false },
});
CategoriesModel.belongsToMany(ProductsModel, {
  through: ProductsCatModel,
  foreignKey: { name: "categoryId", allowNull: false },
});

export default productRouter;
