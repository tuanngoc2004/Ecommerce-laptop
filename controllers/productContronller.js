// import {Order} from "../models/orderModel";
import { 
  createProduct, 
  createProductTable, 
  findByCategory, 
  findById, 
  findByIdAndDelete, 
  findByIdAndUpdate, 
  findCategoryBySlug, 
  findProductsByCategory, 
  findRelatedProducts, 
  getAllProducts, 
  getAllProductsPerPage, 
  getOneProduct, 
  getProductCount,
  searchProduct} from "../models/productModel.js";
  
// import fs from 'fs';
import slugify from "slugify";
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
// import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import dotenv from "dotenv";
import { createOrder, createOrderTable } from "../models/orderModel.js";
import { getIdLoggedIn } from "../middlewares/authMiddleware.js";



dotenv.config();

// payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
    // createProductTable().then((success) => {
    //   if (success) {
    //   console.log("Tables created successfully!");
    //   } else {
    //   console.log("Error creating tables.");
    //   }
    // })
    // .catch((error) => {
    //     console.error("Error creating tables:", error);
    // });

    try {
        const form = new formidable.IncomingForm();
        form.uploadDir = "./uploads"; // Specify the directory for uploading
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;
        form.multiples = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    error: err.message,
                    message: "Error while parsing form data",
                });
            }
            const arrayOfFiles = Object.values(files); // Convert files object to array

            const fileNames = Object.keys(files).map(fieldName => {
                const file = files[fieldName];
                const fileName = file.path.split("\\").pop(); // Extract the filename without the "uploads\" prefix
                return fileName;
            });

            const { name, description, price, category_id, quantity, shipping } = fields;
            const photo = files.photo; // Assuming 'photo' is the field name

            // Validation
            // ...

            const slug = slugify(name);
            const imagePath = photo.path.split("\\").pop(); // Use the filename without the "uploads\" prefix
            console.log(imagePath);

            const isSuccess = await createProduct(
                name,
                slug,
                description,
                price,
                category_id,
                quantity,
                imagePath,
                shipping
            );

            if (isSuccess) {
                res.status(201).send({
                    success: true,
                    message: "Product Created Successfully",
                });
            } else {
                res.status(500).send({
                    success: false,
                    message: "Error in creating product",
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in creating product",
        });
    }
};


//get all products
export const getProductController = async (req, res) => {
    try {
      const products = await getAllProducts();
      res.status(200).send({
        success: true,
        countTotal: products.length,
        message: "All Products",
        countTotal: products.length,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in getting products",
        error: error.message,
      });
    }
  };
  


export const getSingleProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await getOneProduct(slug);

    if (product) {
      // Exclude the photo field
      const { photo, ...productData } = product;

      res.status(200).send({
        success: true,
        message: "Single Product Fetched",
        product: productData,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error: error.message,
    });
  }
};


// get photo




export const productPhotoController = async (req, res) => {
    try {
        const product = await findById(req.params.pid);
        if (product && product.photo) {
            const imageFormat = product.photo.substring(product.photo.lastIndexOf('.') + 1);

            res.set("Content-type", `image/${imageFormat}`);

            const imageData = await fs.readFile(`./uploads/${product.photo}`); // Path to the image

            return res.status(200).send(imageData);
        } else {
            return res.status(404).send({ success: false, message: "Product photo not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting photo",
            error,
        });
    }
};


  


//delete controller


export const deleteProductController = async (req, res) => {
    try {
        const product = await findByIdAndDelete(req.params.pid);
        
        if (product) {
            const imagePath = `./uploads/${product.photo}`;
            await fs.unlink(imagePath); // Delete the image file
            
            res.status(200).send({
                success: true,
                message: "Product Deleted successfully",
            });
        } else {
            res.status(404).send({
                success: false,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while deleting product",
            error,
        });
    }
};


//upate producta


export const updateProductController = async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = "./uploads"; // Specify the directory for uploading
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.multiples = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).send({
          success: false,
          error: err.message,
          message: "Error while parsing form data",
        });
      }

      const { name, description, price, category_id, quantity, shipping } = fields;
      const photo = files.photo; // Assuming 'photo' is the field name

      // Validation
      // ...

      const updatedFields = {
        ...fields,
        slug: slugify(name),
      };

      let updatedPhotoPath = null;

      if (photo) {
        const product = await findById(req.params.pid);
      
        // Delete old photo if it exists
        if (product.photo) {
          const imagePath = `./uploads/${product.photo}`;
          await fs.unlink(imagePath);
        }
      
        // Copy new photo to uploads folder
        updatedPhotoPath = `./uploads/${path.basename(photo.path)}`;
        const newImagePath = path.resolve(updatedPhotoPath);
        await fs.copyFile(photo.path, newImagePath);
      
        // Remove './uploads/' from the updatedPhotoPath
        updatedPhotoPath = updatedPhotoPath.replace('./uploads/', '');
      } else {
        // If no new photo is provided, keep the existing photo path
        const product = await findById(req.params.pid);
        updatedPhotoPath = product.photo;
      }

      const updatedProduct = await findByIdAndUpdate(
        req.params.pid,
        updatedFields,
        updatedPhotoPath
      );

      if (updatedProduct) {
        res.status(201).send({
          success: true,
          message: "Product Updated Successfully",
          product: updatedProduct,
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};


//filters
// export const productFiltersController = async (req, res) => {
//   try {
//     const {checked, radio} = req.body;
//     let args = {};
//     if(checked.length > 0) args.category = checked;
//     if(radio.length > 0) args.price = {$gte: radio[0], $lte:radio[1]};
//     const products = await getAllProducts(args);
//     res.status(200).send({
//       success: true,
//       products,
//     });
//   }catch(error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: 'Error while filtering product',
//       error
//     })
//   }
// }





export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    const products = await findByCategory(checked, radio);

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error while filtering products',
      error
    });
  }
};


// product count
// export const productCountController = async (req, res) => {
//   try{
//     const total = await getAllProducts({}).estimatedDocumentCount();
//     res.status(200).send({
//       success: true,
//       total,
//     })
//   }catch(error){
//     console.log(error);
//     res.status(404).send({
//       message: 'Error in product count',
//       error,
//       success: false
//     })
//   }
// }

export const productCountController = async (req, res) => {
  try{
    const total = await getProductCount();
    res.status(200).send({
      success: true,
      total,
    })
  }catch(error){
    console.log(error);
    res.status(404).send({
      message: 'Error in product count',
      error,
      success: false
    })
  }
}

// product list base on page

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? parseInt(req.params.page) : 1; // Parse the page number as an integer

    const products = await getAllProductsPerPage(perPage, page);

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in product list controller",
      error,
    });
  }
};

// export const productListController = async (req, res) => {
//   try{
//     const perPage = 2;
//     const page = req.params.page ? req.params.page : 1;
//     const products = await productModel
//       .find({})
//       .select("-photo")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .sort({ createdAt: -1 });
//     res.status(200).send({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "error in per page ctrl",
//       error,
//     });
//   }
// }


export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await searchProduct(keyword);
    console.log(products);
    res.json(products);
    // res.status(200).send({
    //   success: true,
    //   products,
    // });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in search product",
      error,
    });
  }
};


// similar products
// export const realtedProductController = async (req, res) => {
//   try {
//     const { pid, cid } = req.params;
//     const products = await productModel
//       .find({
//         category: cid,
//         _id: { $ne: pid },
//       })
//       .select("-photo")
//       .limit(3)
//       .populate("category");
//     res.status(200).send({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "error while geting related product",
//       error,
//     });
//   }
// };




export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const limit = 3; // You can change the limit as needed.

    const relatedProducts = await findRelatedProducts(pid, cid, limit);

    res.status(200).send({
      success: true,
      products: relatedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related products",
      error,
    });
  }
};

// get prdocyst by catgory
// export const productCategoryController = async (req, res) => {
//   try {
//     const category = await categoryModel.findOne({ slug: req.params.slug });
//     const products = await productModel.find({ category }).populate("category");
//     res.status(200).send({
//       success: true,
//       category,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       error,
//       message: "Error While Getting products",
//     });
//   }
// };

export const productCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the category by slug using productModel
    const category = await findCategoryBySlug(slug);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category Not Found",
      });
    }

    // Find products by category using productModel
    const products = await findProductsByCategory(category.id);

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

//payment gateway api
export const braintreeTokenController = async (req, res) => {
  try{
    gateway.clientToken.generate({}, function(err, response) {
      if(err) {
        res.status(500).send(err);
      }else{
        res.send(response);
      }
    })
  }catch(err){
    console.log(err);
  }
}

// export const brainTreePaymentController = async (req, res) => {
//   try {
//     const { nonce, cart } = req.body;
//     let total = 0;
//     cart.map((i) => {
//       total += i.price;
//     });
//     let newTransaction = gateway.transaction.sale(
//       {
//         amount: total,
//         paymentMethodNonce: nonce,
//         options: {
//           submitForSettlement: true,
//         },
//       },
//       function (error, result) {
//         if (result) {
//           const order = new Order({
//             products: cart,
//             payment: result,
//             buyer: req.user._id,
//           }).save();
//           res.json({ ok: true });
//         } else {
//           res.status(500).send(error);
//         }
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };

export const brainTreePaymentController = async (req, res) => {
  createOrderTable().then((success) => {
    if (success) {
      console.log("Tables created successfully!");
    } else {
      console.log("Error creating tables.");
    }
  }).catch((error) => {
    console.error("Error creating tables:", error);
  });

  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });
    console.log(cart);
    const buyer_id = await getIdLoggedIn(req);
    console.log(buyer_id);
    console.log(req.body)
    const orderId = await createOrder(cart, buyer_id, req.body);
  
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in processing payment",
      error: error.message,
    });
  }
};


