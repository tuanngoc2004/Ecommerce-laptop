// In connection.js
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  'full_stack',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
  console.log('Connection established successfully');
}).catch(err => {
  console.log('Unable to connect:' + err);
});

// Export sequelize instance
export default sequelize;
