import JWT from "jsonwebtoken";
import { findUserById } from "../models/userModel.js";

//Protected routes token base
export const requireSignIn = (req, res, next) => {
    try{
        const decode = JWT.verify
            (req.headers.authorization, 
            process.env.JWT_SECRET
        );
        req.user = decode;
        next()
    }catch(e){
        console.log(e);
    }
}


export const isAdmin = async (req, res, next) => {
    try {
      const user = await findUserById(req.user.userId);
      if (user.role_as !== 1) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized access",
        });
      }else{
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(401).send({
        success: false,
        error,
        message: "Error in Admin Middleware",
      });
    }
  };

  export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' }); 
  }

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const getIdLoggedIn = async (req) => {
  try {
    const token = req.headers.authorization || req.cookies.token;

    if (!token) {
      
     
throw new Error('No token found');
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    
    // Ensure that the user ID is available in the decoded token
    if (!decoded.userId) {
      console.error('User ID not found in token');
      return null; // Return null if userId is not found
    }

    
   
return decoded.userId;
  } catch (error) {
    console.error(error);
    return null; // Return null if there's an error or no token
  }
};



