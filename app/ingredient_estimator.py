class IngredientEstimator:

    def __init__(self):

        self.ingredient_map = {

            "pizza": [
                "Pizza dough",
                "Tomato sauce",
                "Mozzarella cheese",
                "Onion",
                "Bell pepper",
                "Olives",
                "Italian herbs"
            ],

            "burger": [
                "Burger bun",
                "Beef or vegetable patty",
                "Lettuce",
                "Tomato",
                "Onion",
                "Cheese",
                "Mayonnaise",
                "Ketchup"
            ],

            "pasta": [
                "Pasta",
                "Tomato sauce",
                "Garlic",
                "Onion",
                "Olive oil",
                "Parmesan cheese",
                "Italian herbs"
            ],

            "spaghetti_bolognese": [
                "Spaghetti",
                "Ground beef",
                "Tomatoes",
                "Tomato sauce",
                "Onion",
                "Garlic",
                "Olive oil",
                "Parmesan cheese",
                "Italian herbs"
            ],

            "fried_rice": [
                "Cooked rice",
                "Carrot",
                "Green peas",
                "Onion",
                "Spring onion",
                "Soy sauce",
                "Garlic",
                "Cooking oil"
            ],

            "biryani": [
                "Basmati rice",
                "Chicken or vegetables",
                "Onion",
                "Tomato",
                "Ginger",
                "Garlic",
                "Green chili",
                "Yogurt",
                "Biryani spices",
                "Mint leaves",
                "Coriander leaves"
            ],

            "ice_cream": [
                "Milk",
                "Cream",
                "Sugar",
                "Vanilla"
            ]
        }


    def get_ingredients(self, dish):

        dish = dish.lower().strip()

        # Exact match
        if dish in self.ingredient_map:

            return self.ingredient_map[dish]


        # Partial match
        for key, ingredients in self.ingredient_map.items():

            if key in dish or dish in key:

                return ingredients


        # Generic fallback
        return [
            "Main ingredient based on detected dish",
            "Cooking oil or butter",
            "Salt",
            "Spices",
            "Herbs"
        ]