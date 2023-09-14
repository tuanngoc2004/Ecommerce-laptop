import  { createCategory, createCategoryTable, findAllCategory, findById, findBySlug, findIdAndDelete, findIdAndUpdate, findNameCategory } from "../models/categoryModel.js";
import slugify from "slugify";
import { findEmailAndUpdate } from "../models/userModel.js";
export const createCategoryController = async (req, res) => {
    createCategoryTable().then((success) => {
        if (success) {
        console.log("Tables created successfully!");
        } else {
        console.log("Error creating tables.");
        }
    })
    .catch((error) => {
        console.error("Error creating tables:", error);
    });

  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }
    // if (!slug) {
    //     return res.status(401).send({ message: "Slug is required" });
    //   }
    const existingCategory = await findNameCategory({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exisits",
      });
    }
    const slug = slugify(name, { lower: true });
    const success = await createCategory(name, slug);

    if (success) {
      return res.status(201).send({
        success: true,
        message: "Category create successfully",
        category,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
      
    });
  }
};
//update category
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const slug = slugify(name, {lower: true}); // Generate the slug
    const category = await findIdAndUpdate(id, { name, slug });
    res.status(200).send({
      success: true,
      messsage: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category",
    });
  }
};

// get all cat
export const categoryControlller = async (req, res) => {
  try {
    const category = await findAllCategory({});
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};


export const singleCategoryController = async (req, res) => {
    try {
      const category = await findBySlug(req.params.slug);
      if (category) {
        res.status(200).send({
          success: true,
          message: "Get Single Category Successfully",
          category,
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Category Not Found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error While Getting Single Category",
      });
    }
  };
  
//delete category

export const deleteCategoryCOntroller = async (req, res) => {
    try {
      const { id } = req.params;
      const isDeleted = await findIdAndDelete(id);
      
      if (isDeleted) {
        res.status(200).send({
          success: true,
          message: "Category Deleted Successfully",
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Category Not Found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error while deleting category",
        error,
      });
    }
  };
  

// export const deleteCategoryCOntroller = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await findIdAndDelete(id);
//     res.status(200).send({
//       success: true,
//       message: "Categry Deleted Successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "error while deleting category",
//       error,
//     });
//   }
// };



export const singleIdCategoryController = async (req, res) => {
  try {
    const category = await findById(req.params.id);
    if (category) {
      res.status(200).send({
        success: true,
        message: "Get Single Category Successfully",
        category,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Category Not Found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Getting Single Category",
    });
  }
};
