import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Product() {

    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);

    useEffect(() => {

        axios.get(`http://localhost:5000/products/${id}`)
            .then(res => {
                setProduct(res.data);

                return axios.get(`http://localhost:5000/categories/${res.data.categoryId}`);
            })
            .then(res => setCategory(res.data));

    }, [id]);

    if (!product || !category)
        return <h2>Ładowanie...</h2>;

    return (
        <div>
            <h1>{product.name}</h1>

            <h3>{product.price} zł</h3>

            <p>Kategoria: {category.name}</p>
        </div>
    );
}

export default Product;