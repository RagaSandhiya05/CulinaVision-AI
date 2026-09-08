import sqlite3
import json
import os
from datetime import datetime


class RecipeDatabase:

    def __init__(self, db_path="data/recipes.db"):
        self.db_path = db_path

        os.makedirs(
            os.path.dirname(self.db_path),
            exist_ok=True
        )

        self.create_table()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def create_table(self):

        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dish_name TEXT NOT NULL,
                confidence REAL,
                ingredients TEXT,
                recipe TEXT,
                preferences TEXT,
                favorite INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        """)

        connection.commit()
        connection.close()

    def save_recipe(
        self,
        dish_name,
        confidence,
        ingredients,
        recipe,
        preferences=None
    ):

        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO recipes (
                dish_name,
                confidence,
                ingredients,
                recipe,
                preferences,
                favorite,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            dish_name,
            confidence,
            json.dumps(ingredients),
            json.dumps(recipe),
            json.dumps(preferences or {}),
            0,
            datetime.now().isoformat()
        ))

        recipe_id = cursor.lastrowid

        connection.commit()
        connection.close()

        return recipe_id

    def get_all_recipes(self):

        connection = self.get_connection()
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()

        cursor.execute("""
            SELECT *
            FROM recipes
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        connection.close()

        recipes = []

        for row in rows:

            recipe = dict(row)

            recipe["ingredients"] = json.loads(
                recipe["ingredients"]
            )

            recipe["recipe"] = json.loads(
                recipe["recipe"]
            )

            recipe["preferences"] = json.loads(
                recipe["preferences"]
            )

            recipe["favorite"] = bool(
                recipe["favorite"]
            )

            recipes.append(recipe)

        return recipes

    def get_recipe(self, recipe_id):

        connection = self.get_connection()
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()

        cursor.execute("""
            SELECT *
            FROM recipes
            WHERE id = ?
        """, (recipe_id,))

        row = cursor.fetchone()

        connection.close()

        if not row:
            return None

        recipe = dict(row)

        recipe["ingredients"] = json.loads(
            recipe["ingredients"]
        )

        recipe["recipe"] = json.loads(
            recipe["recipe"]
        )

        recipe["preferences"] = json.loads(
            recipe["preferences"]
        )

        recipe["favorite"] = bool(
            recipe["favorite"]
        )

        return recipe

    def toggle_favorite(self, recipe_id):

        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE recipes
            SET favorite = CASE
                WHEN favorite = 1 THEN 0
                ELSE 1
            END
            WHERE id = ?
        """, (recipe_id,))

        connection.commit()

        updated = cursor.rowcount > 0

        connection.close()

        return updated

    def get_favorites(self):

        connection = self.get_connection()
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()

        cursor.execute("""
            SELECT *
            FROM recipes
            WHERE favorite = 1
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        connection.close()

        recipes = []

        for row in rows:

            recipe = dict(row)

            recipe["ingredients"] = json.loads(
                recipe["ingredients"]
            )

            recipe["recipe"] = json.loads(
                recipe["recipe"]
            )

            recipe["preferences"] = json.loads(
                recipe["preferences"]
            )

            recipe["favorite"] = bool(
                recipe["favorite"]
            )

            recipes.append(recipe)

        return recipes

    def delete_recipe(self, recipe_id):

        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM recipes
            WHERE id = ?
        """, (recipe_id,))

        connection.commit()

        deleted = cursor.rowcount > 0

        connection.close()

        return deleted

    def search_recipes(self, query):

        connection = self.get_connection()
        connection.row_factory = sqlite3.Row

        cursor = connection.cursor()

        cursor.execute("""
            SELECT *
            FROM recipes
            WHERE dish_name LIKE ?
            ORDER BY created_at DESC
        """, (f"%{query}%",))

        rows = cursor.fetchall()

        connection.close()

        recipes = []

        for row in rows:

            recipe = dict(row)

            recipe["ingredients"] = json.loads(
                recipe["ingredients"]
            )

            recipe["recipe"] = json.loads(
                recipe["recipe"]
            )

            recipe["preferences"] = json.loads(
                recipe["preferences"]
            )

            recipe["favorite"] = bool(
                recipe["favorite"]
            )

            recipes.append(recipe)

        return recipes