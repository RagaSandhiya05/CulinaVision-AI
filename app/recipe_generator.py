import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class RecipeGenerator:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY not found in .env file.")

        self.client = Groq(api_key=api_key)
        self.model = "openai/gpt-oss-120b"

    def generate_recipe(self, dish, ingredients, preferences=None):

        if preferences:
            preferences_text = preferences.to_prompt()
        else:
            preferences_text = """
Spice Level: Medium
Servings: 2
Diet: Any
Allergies: None
Cooking Time: No Preference
Cuisine: No Preference
"""

        ingredients_text = ", ".join(ingredients)

        prompt = f"""
You are CulinaVision AI, an intelligent food and recipe assistant.

The computer vision system detected:

Dish:
{dish}

Estimated ingredients:
{ingredients_text}

User preferences:
{preferences_text}

Generate a practical recipe based on the detected dish.

IMPORTANT:
The ingredients are estimated from the dish classification.
Do not claim that the image provides exact ingredient quantities.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "dish_name": "string",

    "nutrition": {{
        "calories": 0,
        "protein_g": 0,
        "carbohydrates_g": 0,
        "fat_g": 0
    }},

    "timing": {{
        "prep_minutes": 0,
        "cook_minutes": 0,
        "total_minutes": 0
    }},

    "difficulty": "Easy",

    "health_insights": [
        "string",
        "string",
        "string"
    ],

    "allergy_warnings": [
        "string"
    ],

    "ingredients": [
        "string"
    ],

    "instructions": [
        "Step 1",
        "Step 2",
        "Step 3"
    ],

    "chef_tips": [
        "string",
        "string"
    ]
}}

Rules:

1. Respect the user's dietary preference.
2. Respect all listed allergies.
3. Respect the requested spice level.
4. Respect the requested serving size.
5. Prefer the requested cuisine style when applicable.
6. Keep the recipe practical and realistic.
7. Give approximate nutrition values per serving.
8. Clearly mention that nutrition values are estimates.
9. Include allergy warnings when relevant.
10. Do not include Markdown.
11. Return JSON only.
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            response_format={
                "type": "json_object"
            }
        )

        content = response.choices[0].message.content

        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            raise ValueError(
                "Recipe generator returned invalid JSON."
            )

        return result