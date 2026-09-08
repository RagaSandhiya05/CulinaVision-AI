from app.food_validator import FoodValidator
from app.food_classifier import FoodClassifier
from app.ingredient_estimator import IngredientEstimator
from app.recipe_generator import RecipeGenerator


class CulinaVisionPipeline:

    def __init__(self):
        print("Initializing CulinaVision AI...")

        self.validator = FoodValidator()
        self.classifier = FoodClassifier()
        self.ingredient_estimator = IngredientEstimator()
        self.recipe_generator = RecipeGenerator()

        print("CulinaVision AI pipeline ready!")

    def process(self, image_path, preferences=None):

        validation = self.validator.validate(image_path)

        print("\nFood Validation:")
        print(validation)

        if not validation["is_food"]:
            raise ValueError(
                "The uploaded image does not appear to contain food. "
                "Please upload a clear food image."
            )

        predictions = self.classifier.predict(image_path)

        if not predictions:
            raise ValueError(
                "Unable to identify the food in the image."
            )

        top_prediction = predictions[0]

        dish = top_prediction["label"]
        confidence = top_prediction["score"]

        print(f"\nDetected Dish: {dish}")
        print(f"Confidence: {confidence * 100:.2f} %")

        ingredients = self.ingredient_estimator.get_ingredients(dish)

        print("\nEstimated Ingredients:")

        for ingredient in ingredients:
            print(f"- {ingredient}")

        recipe = self.recipe_generator.generate_recipe(
            dish=dish,
            ingredients=ingredients,
            preferences=preferences
        )

        return {
            "dish": dish,
            "confidence": confidence,
            "ingredients": ingredients,
            "recipe": recipe
        }