from transformers import pipeline


class FoodValidator:

    def __init__(self):

        print("Loading food validation model...")

        self.validator = pipeline(
            "zero-shot-image-classification",
            model="openai/clip-vit-base-patch32"
        )

        print("Food validation model loaded successfully.")


    def validate(self, image_path):

        candidate_labels = [
            "a photo of food",
            "a photo of a non-food object"
        ]

        results = self.validator(
            image_path,
            candidate_labels=candidate_labels
        )

        food_score = 0.0
        non_food_score = 0.0

        for result in results:

            label = result["label"]
            score = result["score"]

            if label == "a photo of food":
                food_score = score

            elif label == "a photo of a non-food object":
                non_food_score = score


        is_food = food_score >= non_food_score


        return {
            "is_food": is_food,
            "food_confidence": food_score,
            "non_food_confidence": non_food_score
        }