import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "full_stack"
});

export const createCategoryTable = async () => {
  try {
    const connection = await pool.getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )
    `);

    connection.release();

    console.log("Category table created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating categories table:", error);
    return false;
  }
};

export const createCategory = async (name, slug) => {
    try {
      const connection = await pool.getConnection();
      
      await connection.execute(`
        INSERT INTO categories (name, slug)
        VALUES (?, ?)
      `, [name, slug]);
  
      connection.release();
  
      console.log("Category created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating Category:", error);
      return false;
    }
  };
  
  export const findNameCategory = async (name) => {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(
        "SELECT * FROM categories WHERE name = ?",
        [name]
      );
  
      connection.release();
  
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding user by name:", error);
      return null;
    }
  };

  export const findAllCategory = async () => {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(
        "SELECT * FROM categories",
      );
  
      connection.release();
  
      return rows || []; // Trả về mảng rows chứa toàn bộ dữ liệu từ bảng categories
    } catch (error) {
      console.error("Error finding category:", error);
      return null;
    }
  };


 

export const findBySlug = async (slug) => {
    try {
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(
        "SELECT * FROM categories WHERE slug = ?",
        [slug]
        );

        connection.release();

        return rows.length ? rows[0] : null;
    } catch (error) {
        console.error("Error finding category by slug:", error);
        return null;
    }
};


export const findIdAndUpdate = async (id, dataToUpdate) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
        "UPDATE categories SET name = ?, slug = ? WHERE id = ?",
      [dataToUpdate.name, dataToUpdate.slug, id]
    );

    connection.release();

    return rows.affectedRows > 0 ? dataToUpdate : null;
  } catch (error) {
    console.error("Error updating category by ID:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
};


export const findIdAndDelete = async (id) => {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(
          "DELETE FROM categories WHERE id = ?",
        [id]
      );
  
      connection.release();
  
      return rows.affectedRows > 0;
    } catch (error) {
      console.error("Error updating category by ID:", error);
      throw error; // Rethrow the error to be caught by the calling function
    }
  };
  
  
export const findById = async (id) => {
    try {
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(
        "SELECT * FROM categories WHERE id = ?",
        [id]
        );

        connection.release();

        return rows.length ? rows[0] : null;
    } catch (error) {
        console.error("Error finding category by id:", error);
        return null;
    }
};