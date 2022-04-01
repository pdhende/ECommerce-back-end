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
    console.log(req.body.productIds.length);
    // We take the array of product ids (passed in req body) associated to this tag and get its length
    const prodIDArr = req.body.productIds;
    console.log(prodIDArr);
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

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
