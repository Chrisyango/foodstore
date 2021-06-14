import express from "express";
import multer from "multer";
import RecipesControl from "./recipes.controller.js";

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/images')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
let upload = multer({
    storage: storage
});

const router = express.Router();

router.route("/")
    .get(RecipesControl.apiGetRecipes)
    .post(upload.single('image'), RecipesControl.apiPostRecipes)
    .put(upload.single('image'), RecipesControl.apiUpdateRecipes)
    .delete(RecipesControl.apiDeleteRecipes);
router.route("/id/:id").get(RecipesControl.apiGetRecipesById);

export default router;