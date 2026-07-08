const express = require("express");
const router = express.Router();

let products = require("../data/products");

router.get("/", (req, res) => {
    res.json(products);
});

router.get("/:id", (req, res) => {

    const product = products.find(p => p.id == req.params.id);

    if (!product)
        return res.status(404).json({
            message: "Nie znaleziono produktu"
        });

    res.json(product);
});

router.post("/", (req, res) => {

    const product = {
        id: products.length + 1,
        ...req.body
    };

    products.push(product);

    res.status(201).json(product);
});

router.put("/:id", (req, res) => {

    const index = products.findIndex(p => p.id == req.params.id);

    if (index === -1)
        return res.status(404).json({
            message: "Nie znaleziono produktu"
        });

    products[index] = {
        ...products[index],
        ...req.body
    };

    res.json(products[index]);
});

router.delete("/:id", (req, res) => {

    products = products.filter(p => p.id != req.params.id);

    res.json({
        message: "Usunięto produkt"
    });
});

module.exports = router;