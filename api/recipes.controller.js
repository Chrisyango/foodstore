import RecipesDAO from "../dao/recipesDAO.js";

export default class RecipesController {
    static async apiGetRecipes(req, res, next) {
        const recipesPerPage = req.query.recipesPerPage ? parseInt(req.query.recipesPerPage, 10) : 20;
        const page = req.query.page ? parseInt(req.query.page, 10) : 0;

        let filters = {};
        if (req.query.name) {
            filters.name = req.query.name;
        }

        const { recipesList, totalNumRecipes } = await RecipesDAO.getRecipes({
            filters,
            page,
            recipesPerPage
        });

        let response = {
            recipes: recipesList,
            page: page,
            filters: filters,
            entries_per_page: recipesPerPage,
            total_results: totalNumRecipes
        };
        res.json(response);
    }

    static async apiGetRecipesById(req, res, next) {
        try {
            let id = req.params.id || {};
            let recipe = await RecipesDAO.getRecipeByID(id);
            if (!recipe) {
                res.status(404).json({ error: "Not found" });
                return;
            }
            res.json(recipe);
        } catch (e) {
            console.log(`api, ${e}`);
            res.status(500).json({ error: e });
        }
    }

    static async apiPostRecipes(req, res, next) {
        try {
            const body = JSON.parse(req.body.json);
            const name = body.name;
            const description = body.description;
            const servingsize = body.servingsize;
            const preptime = body.preptime;
            const totaltime = body.totaltime;
            const ingredients = body.ingredients;
            const directions = body.directions;
            const image = req.file;

            const RecipeResponse = await RecipesDAO.addRecipe(name, description, servingsize, preptime, totaltime, ingredients, directions, image);
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async apiUpdateRecipes(req, res, next) {
        try {
            const body = JSON.parse(req.body.json);
            const recipeId = body._id;
            const name = body.name;
            const description = body.description;
            const servingsize = body.servingsize;
            const preptime = body.preptime;
            const totaltime = body.totaltime;
            const ingredients = body.ingredients;
            const directions = body.directions;
            const image = req.file;

            console.log(req.file);

            const RecipeResponse = await RecipesDAO.updateRecipe(recipeId, name, description, servingsize, preptime, totaltime, ingredients, directions, image);

            let { error } = RecipeResponse;
            if (error) {
                res.status(400).json({ error })
            }

            if (RecipeResponse.modifiedCount === 0) {
                throw new Error(
                    "Unable to update recipe"
                )
            }

            res.json({ status: "success" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async apiDeleteRecipes(req, res, next) {
        try {
            const recipeId = req.body._id;

            const RecipeResponse = await RecipesDAO.deleteRecipe(recipeId);

            res.json({ status: "success" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}