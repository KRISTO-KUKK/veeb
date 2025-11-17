const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
	galleryPage,
	galleryPager} = require("../controllers/galleryControllers");

router.route("/").get(galleryPage);

router.route("/:page").get(galleryPager);

module.exports = router;