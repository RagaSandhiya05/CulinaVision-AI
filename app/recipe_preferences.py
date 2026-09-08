class RecipePreferences:

    def __init__(
        self,
        spice_level="Medium",
        servings=2,
        diet="Any",
        allergies=None,
        cooking_time="No Preference",
        cuisine="No Preference"
    ):

        self.spice_level = spice_level
        self.servings = servings
        self.diet = diet
        self.allergies = allergies or []
        self.cooking_time = cooking_time
        self.cuisine = cuisine

    def to_dict(self):

        return {
            "spice_level": self.spice_level,
            "servings": self.servings,
            "diet": self.diet,
            "allergies": self.allergies,
            "cooking_time": self.cooking_time,
            "cuisine": self.cuisine
        }

    def to_prompt(self):

        if self.allergies:

            allergies_text = ", ".join(
                self.allergies
            )

        else:

            allergies_text = "None"

        return f"""
Recipe Preferences:

- Spice Level: {self.spice_level}
- Number of Servings: {self.servings}
- Dietary Preference: {self.diet}
- Cooking Time: {self.cooking_time}
- Preferred Cuisine: {self.cuisine}
- Allergies: {allergies_text}
"""