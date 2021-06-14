import mongodb from "mongodb";
const ObjectID = mongodb.ObjectID;

let recipes;

export default class RecipesDAO {
    static async injectDB(conn) {
        if (recipes) {
            return;
        }
        try {
            recipes = await conn.db(process.env.FOODSTOREDB_NS).collection("recipes");
        } catch (e) {
            console.error(`Unable to establish a collection handle in recipesDAO: ${e}`, )
        }
    };

    static async getRecipes({
        filters = null,
        page = 0,
        recipesPerPage = 20,
    } = {}) {
        let query;
        if (filters) {
            if ("name" in filters) {
                query = { $text: { $search: filters["name"] } }
            }
        }

        let cursor;

        try {
            cursor = await recipes.find(query);
        } catch (e) {
            console.error(`Unable to find command, ${e}`);
            return { recipesList: [], totalNumRecipes: 0 }
        }

        const displayCursor = cursor.limit(recipesPerPage).skip(recipesPerPage * page);

        try {
            const recipesList = await displayCursor.toArray();
            const totalNumRecipes = await recipes.countDocuments(query);

            return { recipesList, totalNumRecipes };
        } catch (e) {
            console.error(`Unable to convert cursor to array or problem counting document, ${e}`);
            return { recipesList: [], totalNumRecipes: 0 };
        }
    };

    static async getRecipeByID(id) {
        try {
            return await recipes.find({ _id: new ObjectID(id) }).next();
        } catch (e) {
            console.error(`Something went wrong in getRecipeByID: ${e}`);
            throw e;
        }
    }

    static async addRecipe(name, description, servingsize, preptime, totaltime, ingredients, directions, image) {
        try {
            const recipeDoc = {
                name: name,
                description: description,
                servingsize: servingsize,
                preptime: preptime,
                totaltime: totaltime,
                ingredients: ingredients,
                directions: directions,
                image: image
            };
            return await recipes.insertOne(recipeDoc);
        } catch (e) {
            console.error(`Unable to post recipe: ${e}`);
            return { error: e }
        }
    }

    static async updateRecipe(recipeId, name, description, servingsize, preptime, totaltime, ingredients, directions, image) {
        try {
            const updateRecipe = await recipes.updateOne({ _id: ObjectID(recipeId) }, {
                $set: {
                    name: name,
                    description: description,
                    servingsize: servingsize,
                    preptime: preptime,
                    totaltime: totaltime,
                    ingredients: ingredients,
                    directions: directions,
                    image: image
                }
            });
            return updateRecipe;
        } catch (e) {
            console.error(`Unable to update recipe: ${e}`);
            return { error: e };
        }
    }

    static async deleteRecipe(recipeId) {
        try {
            const deleteRecipe = await recipes.deleteOne({
                _id: ObjectID(recipeId)
            });
            return deleteRecipe;
        } catch (e) {
            console.error(`Unable to delete recipe: ${e}`);
            return { error: e };
        }
    }
}