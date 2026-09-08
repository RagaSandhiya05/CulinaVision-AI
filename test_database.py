from app.recipe_database import RecipeDatabase


db = RecipeDatabase()

recipe_id = db.save_recipe(
    dish_name="Test Pizza",
    confidence=0.92,
    ingredients=[
        "Pizza dough",
        "Tomato sauce",
        "Mozzarella cheese"
    ],
    recipe={
        "dish_name": "Test Pizza",
        "nutrition": {
            "calories": 500,
            "protein_g": 20,
            "carbohydrates_g": 60,
            "fat_g": 18
        },
        "timing": {
            "prep_minutes": 15,
            "cook_minutes": 15,
            "total_minutes": 30
        },
        "difficulty": "Easy",
        "health_insights": [
            "Good source of carbohydrates."
        ],
        "allergy_warnings": [
            "Contains dairy."
        ],
        "ingredients": [
            "Pizza dough",
            "Tomato sauce",
            "Mozzarella cheese"
        ],
        "instructions": [
            "Prepare the dough.",
            "Add sauce and toppings.",
            "Bake until golden."
        ],
        "chef_tips": [
            "Serve hot."
        ]
    },
    preferences={
        "spice_level": "Medium",
        "servings": 2,
        "diet": "Any"
    }
)

print("Saved Recipe ID:", recipe_id)

print("\nAll Recipes:")
print(db.get_all_recipes())

print("\nToggling Favorite...")
print(db.toggle_favorite(recipe_id))

print("\nFavorites:")
print(db.get_favorites())