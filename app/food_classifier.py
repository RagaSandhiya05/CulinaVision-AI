from transformers import pipeline
from PIL import Image


class FoodClassifier:

    def __init__(self):
        print("Loading food recognition model...")

        self.classifier = pipeline(
            "image-classification",
            model="nateraw/food"
        )

        print("Model loaded successfully!")

    def predict(self, image_path, top_k=5):

        image = Image.open(image_path).convert("RGB")

        predictions = self.classifier(
            image,
            top_k=top_k
        )

        return predictions


if __name__ == "__main__":

    classifier = FoodClassifier()

    image_path = "assets/images/test_food.jpg"

    results = classifier.predict(image_path)

    print("\nFood Predictions:")

    for result in results:
        print(
            f"{result['label']} "
            f"-> {result['score'] * 100:.2f}%"
        )