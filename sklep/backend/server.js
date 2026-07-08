const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", require("./routes/products"));
app.use("/categories", require("./routes/categories"));

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});