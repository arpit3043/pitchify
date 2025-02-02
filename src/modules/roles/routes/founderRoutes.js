const express = require("express");
const router = express.Router();
const founderController = require("../controllers/founderController");

router.post("/create", founderController.createFounder);
router.get("/", founderController.getFounders);
router.get("/:id", founderController.getFounderById);
router.delete("/:id", founderController.deleteFounder);

module.exports = router;
