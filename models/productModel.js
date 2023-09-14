import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "full_stack"
});

export const createProductTable = async () => {
    try {
      const connection = await pool.getConnection();
  
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          description VARCHAR(2025) NOT NULL,
          price FLOAT NOT NULL,
          category_id INT,
          quantity INT,
          photo VARCHAR(2025) NOT NULL,
          shipping TINYINT DEFAULT 0, 
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);
  
      connection.release();
  
      console.log("Products table created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating products table:", error);
      return false;
    }
};
  
export const createProduct = async (name, slug, description, price, category_id, quantity, photo, shipping) => {
    try {
      const connection = await pool.getConnection();
      
      await connection.execute(`
        INSERT INTO products (name, slug, description, price, category_id, quantity, photo, shipping)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, slug, description, price, category_id, quantity, photo, shipping]);
  
      connection.release();
  
      console.log("Product created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating Product:", error);
      return false;
    }
  };
  

  export const getAllProducts = async () => {
    try {
      const connection = await pool.getConnection();
  
      const [rows] = await connection.execute(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC
      `);
  
      connection.release();
  
      return rows;
    } catch (error) {
      console.error("Error getting all products:", error);
      return [];
    }
  };


export const getOneProduct = async (slug) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT * FROM products WHERE slug = ? LIMIT 1",
      [slug]
    );

    connection.release();

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product by slug:", error);
    throw error;
  }
};


export const findById = async (id) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    connection.release();

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error finding product by ID:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
};



export const findByIdAndDelete = async (productId) => {
    try {
        const connection = await pool.getConnection();
        
        const [rows, _] = await connection.execute(
            "SELECT * FROM products WHERE id = ?",
            [productId]
        );

        if (rows.length === 0) {
            connection.release();
            return null;
        }

        const product = rows[0];
        
        await connection.execute(
            "DELETE FROM products WHERE id = ?",
            [productId]
        );

        connection.release();

        return product;
    } catch (error) {
        console.error("Error deleting product:", error);
        return null;
    }
};

  
// export const findByIdAndDelete = async (productId) => {
//   try {
//     const connection = await pool.getConnection();
    
//     const [rows, _] = await connection.execute(
//       "DELETE FROM products WHERE id = ?",
//       [productId]
//     );

//     connection.release();

//     if (rows.affectedRows > 0) {
//       console.log("Product deleted successfully!");
//       return true;
//     } else {
//       console.log("Product not found for deletion.");
//       return false;
//     }
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     return false;
//   }
// };


// productModel.js


export const findByIdAndUpdate = async (productId, updatedFields, updatedPhotoPath) => {
    try {
        const connection = await pool.getConnection();

        const updateQuery = `
            UPDATE products
            SET name = ?, description = ?, price = ?, category_id = ?, quantity = ?, shipping = ?, photo = ?
            WHERE id = ?`;

        const queryParams = [
            updatedFields.name,
            updatedFields.description,
            updatedFields.price,
            updatedFields.category_id,
            updatedFields.quantity,
            updatedFields.shipping,
            updatedPhotoPath || null,
            productId
        ];

        await connection.execute(updateQuery, queryParams);

        connection.release();

        const updatedProduct = await findById(productId); // Fetch the updated product after the update

        return updatedProduct;
    } catch (error) {
        console.error("Error updating product:", error);
        return null;
    }
};


export const findByCategory = async (checked, radio) => {
  try {
    let categoryFilter = "";
    if (checked.length > 0) {
      const categoryIds = checked.join(",");
      categoryFilter = `AND category_id IN (${categoryIds})`;
    }

    let priceFilter = "";
    if (radio.length > 0) {
      priceFilter = `AND price >= ${radio[0]} AND price <= ${radio[1]}`;
    }

    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1 ${categoryFilter} ${priceFilter}
      ORDER BY p.created_at DESC
    `;

    const [rows] = await pool.execute(query);

    return rows;
  } catch (error) {
    console.error("Error finding products by category:", error);
    throw error;
  }
};



export const getProductCount = async () => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT COUNT(*) AS total FROM products"
    );

    connection.release();

    return rows[0].total;
  } catch (error) {
    console.error("Error getting product count:", error);
    throw error;
  }
};


export const getAllProductsPerPage = async (perPage, page) => {
  try {
    const connection = await pool.getConnection();

    const offset = (page - 1) * perPage;

    const [rows] = await connection.execute(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [perPage, offset]);

    connection.release();

    return rows;
  } catch (error) {
    console.error("Error getting products with pagination:", error);
    return [];
  }
};



//search
export const searchProduct = async (keyword) => {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.description LIKE ?
    `;

    const [rows] = await connection.execute(query, [`%${keyword}%`, `%${keyword}%`]);

    connection.release();

    return rows;
  } catch (error) {
    console.error("Error in search product:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
};

// export const searchProduct = async (req, res) => {
//   try {
//     const { keyword } = req.params;
//     const connection = await pool.getConnection(); // Assuming you already have a 'pool' for MySQL connection.

//     const query = `
//       SELECT * FROM products
//       WHERE name LIKE ? OR description LIKE ?
//     `;
    
//     const [rows] = await connection.execute(query, [`%${keyword}%`, `%${keyword}%`]);

//     connection.release();

//     res.status(200).send({
//       success: true,
//       products: rows,
//     });
//   } catch (error) {
//     console.error("Error in search product:", error);
//     res.status(500).send({
//       success: false,
//       message: "Error in search product",
//       error: error.message,
//     });
//   }
// };


export const findRelatedProducts = async (productId, categoryId, limit = 3) => {
  try {
    const connection = await pool.getConnection();

    // Query to fetch related products based on category_id and exclude the current product (productId).
    const query = `
      SELECT * FROM products
      WHERE category_id = ? AND id != ?
      LIMIT ?
    `;

    const [rows] = await connection.execute(query, [categoryId, productId, limit]);
    connection.release();

    return rows;
  } catch (error) {
    console.error("Error fetching related products:", error);
    throw error;
  }
};


///////

export const findCategoryBySlug = async (slug) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM categories WHERE slug = ?",
      [slug]
    );
    connection.release();

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error finding category by slug:", error);
    throw error;
  }
};

export const findProductsByCategory = async (categoryId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM products WHERE category_id = ?",
      [categoryId]
    );
    connection.release();

    return rows;
  } catch (error) {
    console.error("Error finding products by category:", error);
    throw error;
  }
};


