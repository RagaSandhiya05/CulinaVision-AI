from app.food_validator import FoodValidator

validator = FoodValidator()

image_path = "assets/images/test_food.jpg"

result = validator.validate(image_path)

print("\nFood Validation Result")
print("----------------------")

print("Is Food:", result["is_food"])

print(
    "Food Confidence:",
    round(result["food_confidence"] * 100, 2),
    "%"
)

print(
    "Non-Food Confidence:",
    round(result["non_food_confidence"] * 100, 2),
    "%"
)