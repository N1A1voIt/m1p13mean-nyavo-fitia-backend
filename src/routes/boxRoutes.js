const express = require('express');
const router = express.Router();
const {
    getBoxes,
    getBox,
    createBox,
    updateBox,
    assignTenant,
    releaseTenant,
    getBoxContract,
    deleteBox
} = require('../controllers/boxController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/')
    .get(getBoxes)
    .post(authorize('admin'), createBox);

router.route('/:id')
    .get(getBox)
    .patch(authorize('admin'), updateBox)
    .delete(authorize('admin'), deleteBox);

router.post('/:id/assign', authorize('admin'), assignTenant);
router.post('/:id/release', authorize('admin'), releaseTenant);
router.get('/:id/contract', authorize('admin'), getBoxContract);

module.exports = router;
