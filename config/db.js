import mysql from "mysql";
import colors from "colors";

const connectDB = async () => {
    try{
        const conn = await mysql.createConnection(process.env.GO_URL);
        console.log(`Connected to MySQL Database on host ${conn.config.host}`.bgMagenta.white);
    }catch(e){
        console.log(`Error in Mongodb ${e}`.bgRed.white)
    }
}

export default connectDB;



