const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const allTags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'products' }]
    });
    res.status(200).json(allTags);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagById = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'products' }]
    });

    if (!tagById) {
      res.status(404).json({ message: 'The tag with this id is not found!' });
      return;
    }

    res.status(200).json(tagById);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);
    // console.log(req.body.productIds.length);
    // We take the array of product ids (passed in req body) associated to this tag and get its length
    const prodIDArr = req.body.productIds;
    // console.log(prodIDArr);
    if (prodIDArr.length) {
      // Then we create a new array using map to return objects which contain key value pairs of tag_id and associated product id.
      const mapProdArr = prodIDArr.map((product_id) => {
        return {
          tag_id: newTag.id,
          product_id
        };
      });
      // Then we add this array to the junction table to establish the many-to-many associations between tag and products
      const prodTag = await ProductTag.bulkCreate(mapProdArr);
      res.status(200).json(prodTag);
    } else {
      res.status(200).json(newTag);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const updatdTag = await Tag.update(req.body, {
      where: {
        id: req.params.id
      },
    });

    // Get all the existing products associated to this tag
    const assocProducts = await ProductTag.findAll({
      where: {
        tag_id: req.params.id,
      }
    });
    console.log(assocProducts);
    // Extract only the product ids from assocProducts
    const assocProductIds = assocProducts.map(( { product_id }) => product_id);
    console.log(assocProductIds);
    // Get the product id list provided in the update request body
    const newProducts = req.body.productIds;
    console.log(newProducts);

    // // Filter out product ids that do not exist in the already associated products array (that need to be added)
    let newProductIds = newProducts.filter((product_id) => !assocProductIds.includes(product_id));
    console.log(newProductIds);

    // // create new array consisting of objects with product_id and tag_id to add to the ProductTag table
    newProductIds = newProductIds.map((product_id) => {
      return {
        tag_id: req.params.id,
        product_id
      };
    });
    console.log(newProductIds);

    // Filter out products that exist in the already associated products array and are not present in the new Product ids array(that need to be removed)
    let oldProductIds = assocProducts.filter(({ product_id }) => !newProducts.includes(product_id));
    console.log(oldProductIds);

    oldProductIds = oldProductIds.map(({ id }) => id);
    console.log(oldProductIds);

    const deletdProductIds = await ProductTag.destroy({
      where: {
        id: oldProductIds,
      }
    });

    const updatdProductIds = await ProductTag.bulkCreate(newProductIds);
    res.status(200).json(updatdProductIds);

  } catch (err) {
    res.status(400).json(err);
  }

});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const deletdTag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!deletdTag) {
      res.status(404).json({ message: 'The tag with this id is not found!' });
      return;
    }

    res.status(200).json(deletdTag);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
