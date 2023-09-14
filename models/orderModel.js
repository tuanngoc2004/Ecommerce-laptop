import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "full_stack"
});

export const createOrderTable = async () => {
    try {
      const connection = await pool.getConnection();
  
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          products JSON NOT NULL,
          status ENUM('Not Process', 'Processing', 'Shipped', 'Delivered', 'Canceled') DEFAULT 'Not Process',
          buyer_id INT NOT NULL,
          payment JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL
        )
      `);
  
      connection.release();
  
      console.log("Orders table created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating orders table:", error);
      return false;
    }
  };
  


export const createOrder = async (products, buyerId, paymentDetails) => {
    try {
        const connection = await pool.getConnection();

        // Begin a transaction to ensure atomicity
        await connection.beginTransaction();

        try {
            // Check if required parameters are provided
            if (!products || !buyerId || !paymentDetails) {
                console.error('Missing required parameters for creating an order:');
                if (!products) console.error('- products');
                if (!buyerId) console.error('- buyerId');
                if (!paymentDetails) console.error('- paymentDetails');
                
                throw new Error('Missing required parameters for creating an order.');
            }

            // Insert the order into the database
            const [result] = await connection.execute(
                `
                INSERT INTO orders (products, status, buyer_id, payment)
                VALUES (?, ?, ?, ?)
            `,
                [JSON.stringify(products), 'Not Process', buyerId, JSON.stringify(paymentDetails)]
            );

            const orderId = result.insertId;

            // Commit the transaction if everything is successful
            await connection.commit();

            return orderId;
        } catch (error) {
            // Rollback the transaction in case of an error
            await connection.rollback();
            throw error;
        } finally {
            connection.release(); // Release the database connection
        }
    } catch (error) {
        throw error;
    }
};


// import { DataTypes } from 'sequelize';
// import sequelize from "../config/connection";


// const Order = sequelize.define('Order', {
//   status: {
//     type: DataTypes.ENUM('Not Process', 'Processing', 'Shipped', 'Delivered', 'Canceled'),
//     defaultValue: 'Not Process'
//   },
//   payment: {
//     type: DataTypes.JSON
//   }
// }, {
//   timestamps: true
// });

// // Define associations
// Order.belongsTo(sequelize.models.User, { as: 'buyer' }); // Assuming you have a User model

// sequelize.sync({ alter: true }) // You can use 'alter' to modify tables if needed
//   .then(() => {
//     console.log('Order table created successfully');
//   })
//   .catch((err) => {
//     console.error('Unable to create Order table:', err);
//   });

// export default Order;
