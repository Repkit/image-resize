const express = require('express')
 
const image = require('../controllers/imageController')
// const image = require('../controllers/imgController')
 
const router = express.Router()
 
router.get('/stats', image.stats)
router.get('/stats/:image', image.imageStats)
router.get('/:image', image.resize)

module.exports = router