const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController');

router.use(authenticate);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
