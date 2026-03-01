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
router.use(authorize('admin'));

router.route('/')
    .get(getBoxes)
    .post(createBox);

router.route('/:id')
    .get(getBox)
    .patch(updateBox)
    .delete(deleteBox);

router.post('/:id/assign', assignTenant);
router.post('/:id/release', releaseTenant);
router.get('/:id/contract', getBoxContract);

module.exports = router;
