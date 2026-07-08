import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        axios.get("http://localhost:5000/products")
            .then(res => setProducts(res.data));

    }, []);

    return (

        <div>

            <h1>Sklep</h1>

            {
                products.map(product => (

                    <div key={product.id}>

                        <h3>{product.name}</h3>

                        <p>{product.price} zł</p>

                        <Link to={`/product/${product.id}`}>
                            Szczegóły
                        </Link>

                    </div>

                ))
            }

        </div>

    );
}

export default Products;