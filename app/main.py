from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Request,
    Form,
    HTTPException
)

from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

import shutil
import os

from app.pipeline import CulinaVisionPipeline
from app.recipe_preferences import RecipePreferences
from app.recipe_database import RecipeDatabase


app = FastAPI(
    title="CulinaVision AI",
    description="AI-powered food image to recipe generator",
    version="1.0"
)


UPLOAD_DIR = "assets/uploads"
TEMPLATE_DIR = "templates"
ASSETS_DIR = "assets"

os.makedirs(UPLOAD_DIR, exist_ok=True)


app.mount(
    "/assets",
    StaticFiles(directory=ASSETS_DIR),
    name="assets"
)

templates = Jinja2Templates(
    directory=TEMPLATE_DIR
)


print("Loading CulinaVision AI pipeline...")

pipeline = CulinaVisionPipeline()
database = RecipeDatabase()

print("CulinaVision AI pipeline ready!")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    spice_level: str = Form("Medium"),
    servings: int = Form(2),
    diet: str = Form("Any"),
    allergies: str = Form(""),
    cooking_time: str = Form("No Preference"),
    cuisine: str = Form("No Preference")
):

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    allergy_list = [
        allergy.strip()
        for allergy in allergies.split(",")
        if allergy.strip()
    ]

    preferences = RecipePreferences(
        spice_level=spice_level,
        servings=servings,
        diet=diet,
        allergies=allergy_list,
        cooking_time=cooking_time,
        cuisine=cuisine
    )

    try:
        result = pipeline.process(
            file_path,
            preferences
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    recipe_id = database.save_recipe(
        dish_name=result["dish"],
        confidence=result["confidence"],
        ingredients=result["ingredients"],
        recipe=result["recipe"],
        preferences=preferences.to_dict()
    )

    return {
        "id": recipe_id,
        "filename": file.filename,
        "dish": result["dish"],
        "confidence": result["confidence"],
        "ingredients": result["ingredients"],
        "recipe": result["recipe"]
    }


@app.get("/recipes")
async def get_recipes():
    return {
        "recipes": database.get_all_recipes()
    }


@app.get("/recipes/search")
async def search_recipes(q: str = ""):

    q = q.strip()

    if not q:
        return {
            "recipes": database.get_all_recipes()
        }

    return {
        "recipes": database.search_recipes(q)
    }


@app.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: int):

    recipe = database.get_recipe(
        recipe_id
    )

    if not recipe:
        raise HTTPException(
            status_code=404,
            detail="Recipe not found."
        )

    return recipe


@app.get("/favorites")
async def get_favorites():
    return {
        "recipes": database.get_favorites()
    }


@app.post("/recipes/{recipe_id}/favorite")
async def toggle_favorite(recipe_id: int):

    updated = database.toggle_favorite(
        recipe_id
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Recipe not found."
        )

    return {
        "message": "Favorite status updated.",
        "recipe_id": recipe_id
    }


@app.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: int):

    deleted = database.delete_recipe(
        recipe_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Recipe not found."
        )

    return {
        "message": "Recipe deleted successfully.",
        "recipe_id": recipe_id
    }