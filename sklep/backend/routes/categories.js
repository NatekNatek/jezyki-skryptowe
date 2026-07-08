const express = require("express");
const router = express.Router();

let categories = require("../data/categories");

router.get("/", (req, res) => {
    res.json(categories);
});

router.get("/:id", (req, res) => {
    const category = categories.find(c => c.id == req.params.id);

    if (!category)
        return res.status(404).json({
            message: "Nie znaleziono kategorii"
        });

    res.json(category);
});

module.exports = router;