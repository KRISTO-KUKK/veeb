const express = require("express");
const router = express.Router();

const {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	ametid,
	ametidAdd,
	ametidAddPost} = require("../controllers/eestifilmControllers");

router.route("/").get(eestifilm);

router.route("/inimesed").get(inimesed);

router.route("/inimesed_add").get(inimesedAdd);
router.route("/inimesed_add").post(inimesedAddPost);

router.route("/ametid_add").get(ametidAdd);
router.route("/ametid_add").post(ametidAddPost);

router.route("/ametid").get(ametid);

module.exports = router;