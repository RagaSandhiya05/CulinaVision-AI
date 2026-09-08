# 🍽️ CulinaVision AI

> **AI-powered food intelligence system that combines computer vision and generative AI to validate and identify dishes, estimate ingredients, and generate personalized recipes with nutrition insights, cooking details, dietary preferences, allergy warnings, and health recommendations using PyTorch, Hugging Face, FastAPI, and GPT-OSS 120B.**


## 📌 Overview

**CulinaVision AI** is an AI-powered food intelligence application that transforms a food image into a personalized recipe.

The system combines **computer vision, deep learning, ingredient estimation, and generative AI** to analyze an uploaded food image, identify the likely dish, estimate its ingredients, and generate a customized recipe according to the user's preferences.

Users can customize the generated recipe based on:

- 🌶️ Spice level
- 🍽️ Number of servings
- 🥗 Dietary preference
- 🚫 Allergies
- ⏱️ Cooking time
- 🌍 Cuisine preference

CulinaVision AI also provides additional recipe intelligence such as **nutrition information, cooking time, difficulty level, health insights, allergy warnings, and chef tips**.

Generated recipes are automatically stored in a **SQLite database**, allowing users to view their recipe history, mark recipes as favorites, open previously generated recipes, and delete recipes.


## ✨ Key Features

### 📸 1. Food Image Upload

Users can upload food images through:

- Browse Image button
- Drag and drop
- JPG / JPEG
- PNG
- WEBP

The application also provides:

- Image preview
- Image removal
- File type validation
- Maximum 10 MB file-size validation


### 🔍 2. Food Image Validation

Before processing the image, CulinaVision AI verifies whether the uploaded image appears to contain food.

If the uploaded image is identified as non-food, the system stops the pipeline and displays:

> **The uploaded image does not appear to contain food. Please upload a clear food image.**

This prevents irrelevant images from being sent to the food classification and recipe generation stages.


### 🍽️ 3. Food Classification

The application uses a Hugging Face food classification model to identify the likely dish from the uploaded image.

The current implementation uses:

```text
nateraw/food
````

The classifier returns the predicted dish along with its confidence score.

Example:

```text
Detected Dish:
Pizza

AI Confidence:
92.4%
```


### 🥕 4. Ingredient Estimation

After identifying the dish, CulinaVision estimates a list of likely ingredients associated with that food.

The estimated ingredients are then provided to the recipe-generation stage.

> **Note:** Ingredient estimation is currently a baseline estimation based on the detected dish. It does not claim to identify exact ingredients or quantities directly from individual image pixels.


### ⚙️ 5. Personalized Recipe Generation

The detected dish, estimated ingredients, and user preferences are passed to the generative AI layer.

The system uses:

```text
GPT-OSS 120B
```

through the **Groq API** to generate a structured recipe.

The generated recipe considers:

* Spice level
* Servings
* Dietary preference
* Allergies
* Cooking time
* Cuisine preference


### 🌶️ 6. Recipe Preferences

Users can customize their recipes using:

| PreferenceAvailable Options |                                                |
| --------------------------- | ---------------------------------------------- |
| 🌶️ Spice Level             | Mild, Medium, Spicy                            |
| 🍽️ Servings                | 1–8                                            |
| 🥗 Diet                     | Any, Vegetarian, Vegan                         |
| ⏱️ Cooking Time             | No Preference, Quick, Normal                   |
| 🌍 Cuisine                  | No Preference, Indian, Italian, Asian, Mexican |
| 🚫 Allergies                | User-defined                                   |

Allergies can be entered as comma-separated values.

Example:

```text
peanuts, milk
```


## 🥗 Recipe Intelligence

CulinaVision AI does more than generate basic cooking instructions.

Each generated recipe can contain:

### ⏱️ Cooking Information

* Preparation time
* Cooking time
* Total time
* Difficulty level

Example:

```text
Prep Time: 15 min
Cook Time: 25 min
Total Time: 40 min
Difficulty: Easy
```


### 🥗 Nutrition Information

The system provides approximate nutrition information per serving:

* 🔥 Calories
* 💪 Protein
* 🍚 Carbohydrates
* 🥑 Fat

Example:

```text
Calories: 420 kcal
Protein: 18 g
Carbohydrates: 52 g
Fat: 16 g
```

> Nutrition values are AI-generated estimates and should not be treated as medically or nutritionally exact measurements.


### 💡 Health Insights

The generated recipe can include health-related insights such as:

* Nutritional benefits
* Ingredient-related benefits
* General dietary considerations


### ⚠️ Allergy Warnings

The recipe generation system considers the user's allergy preferences and can provide relevant allergy warnings.

Example:

```text
⚠️ Allergy Information

- Contains dairy.
- Check packaged ingredients for traces of nuts.
```


### 👨‍🍳 Chef Tips

The AI can provide additional preparation and cooking suggestions to improve the recipe.

Examples include:

* Cooking techniques
* Ingredient substitutions
* Texture improvements
* Serving suggestions


## 📚 Recipe History

Every successfully generated recipe is automatically stored in the SQLite database.

The history section allows users to:

* 📖 View all generated recipes
* ❤️ View favorite recipes
* 👀 Open previously generated recipes
* 🗑️ Delete recipes
* 📅 View recipe creation dates
* 🎯 View classification confidence
* 🥕 Preview ingredients
* ⏱️ View cooking time
* 📊 View difficulty
* 🔥 View calories
* 💪 View protein information


## ❤️ Favorites

Users can mark generated recipes as favorites.

The application provides two history filters:

```text
All Recipes
❤️ Favorites
```

Favorites are stored in the database and remain available when the application is refreshed.


## 🗑️ Delete Recipes

Users can permanently remove recipes from their recipe history.

A confirmation dialog is displayed before deletion.


## 🔄 Generate Another Recipe

After viewing a generated recipe, users can select:

```text
🔄 Generate Another Recipe
```

This resets the image-upload interface and allows another food image to be processed.


# 🧠 System Architecture

```text
                    ┌─────────────────────┐
                    │     Food Image      │
                    │   JPG / PNG / WEBP  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Food Validator    │
                    │  Food / Non-Food    │
                    └──────────┬──────────┘
                               │
                         Valid Food
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Food Classifier    │
                    │ Hugging Face Model  │
                    └──────────┬──────────┘
                               │
                         Dish Prediction
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Ingredient Estimator│
                    │  Estimated List     │
                    └──────────┬──────────┘
                               │
                               ▼
              ┌─────────────────────────────────┐
              │       Recipe Preferences        │
              │                                 │
              │ Spice • Servings • Diet         │
              │ Allergies • Time • Cuisine      │
              └────────────────┬────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Recipe Generator  │
                    │    Groq API         │
                    │   GPT-OSS 120B     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Recipe Intelligence│
                    │                     │
                    │ Nutrition           │
                    │ Timing              │
                    │ Instructions        │
                    │ Health Insights     │
                    │ Allergy Warnings    │
                    │ Chef Tips           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    SQLite Database  │
                    │                     │
                    │ Recipe History      │
                    │ Favorites           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Web Application    │
                    │   FastAPI + JS      │
                    └─────────────────────┘
```


# 🔄 How It Works

CulinaVision AI follows a multi-stage processing pipeline.

### Step 1 — Upload Image

The user uploads a food image through the web interface.

```text
User → Upload Food Image
```

The frontend validates the file type and size before sending it to the backend.


### Step 2 — Food Validation

The image is passed to the food validation module.

```text
Image
  ↓
Food Validator
  ↓
Food / Non-Food
```

If the image is not considered food, processing stops and an appropriate error message is returned.


### Step 3 — Food Classification

Valid food images are passed to the food classifier.

```text
Food Image
    ↓
Hugging Face Food Classifier
    ↓
Dish + Confidence Score
```

Example:

```text
Dish: Biryani
Confidence: 91.7%
```


### Step 4 — Ingredient Estimation

The predicted dish is passed to the ingredient estimation module.

```text
Detected Dish
     ↓
Ingredient Estimator
     ↓
Estimated Ingredients
```

Example:

```text
Rice
Chicken
Onion
Tomato
Spices
Oil
Ginger
Garlic
```


### Step 5 — Apply User Preferences

The system collects the user's recipe preferences.

```text
Spice Level
Servings
Diet
Allergies
Cooking Time
Cuisine
```

These preferences are converted into structured data and provided to the recipe generator.


### Step 6 — Generative AI

The dish, estimated ingredients, and preferences are sent to GPT-OSS 120B through Groq.

```text
Dish
 +
Ingredients
 +
Preferences
       ↓
GPT-OSS 120B
       ↓
Structured Recipe
```


### Step 7 — Recipe Intelligence

The generated recipe contains structured information such as:

```text
Recipe
├── Timing
├── Difficulty
├── Nutrition
├── Ingredients
├── Instructions
├── Health Insights
├── Allergy Warnings
└── Chef Tips
```


### Step 8 — Store Recipe

The completed recipe is saved automatically in SQLite.

```text
Generated Recipe
       ↓
SQLite Database
       ↓
Recipe History
```


### Step 9 — Display Results

The frontend displays the generated information in an interactive interface.

Users can then:

* View the recipe
* Favorite it
* Generate another recipe
* View it later from history
* Delete it


# 🛠️ Tech Stack

## Frontend

* **HTML5** — Application structure
* **CSS3** — Responsive and modern UI
* **JavaScript** — Frontend interaction and API communication


## Backend

* **Python** — Core programming language
* **FastAPI** — REST API and backend framework
* **Uvicorn** — ASGI server


## Artificial Intelligence

* **PyTorch** — Deep learning framework
* **TorchVision** — Computer vision utilities
* **Hugging Face Transformers** — Pretrained AI models
* **Hugging Face Food Classification Model** — Food recognition
* **Groq API** — High-speed LLM inference
* **GPT-OSS 120B** — Recipe generation and recipe intelligence


## Database

* **SQLite** — Local recipe storage
* **JSON** — Structured storage of ingredients, recipes, and preferences


## Development Tools

* **Python Virtual Environment (****`venv`****)**
* **VS Code**
* **Git**
* **GitHub**


# 📁 Project Structure

```text
CulinaVision-AI/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── pipeline.py
│   ├── food_validator.py
│   ├── food_classifier.py
│   ├── ingredient_estimator.py
│   ├── recipe_generator.py
│   ├── recipe_preferences.py
│   └── recipe_database.py
│
├── data/
│   └── recipes.db
│
├── assets/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── script.js
│   │
│   ├── images/
│   │   └── test_food.jpg
│   │
│   └── uploads/
│
├── templates/
│   └── index.html
│
├── test_database.py
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

> **Important:** `.env` and generated database/upload files should not be committed to GitHub.


# 📦 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CulinaVision-AI.git
```

Navigate into the project:

```bash
cd CulinaVision-AI
```


## 2. Create a Virtual Environment

Windows:

```bash
python -m venv venv
```

Activate the environment:

```bash
venv\Scripts\activate
```


## 3. Install Dependencies

```bash
pip install -r requirements.txt
```


# 🔐 Environment Configuration

Create a `.env` file in the project root:

```text
CulinaVision-AI/
└── .env
```

Add your Groq API key:

```env
GROQ_API_KEY=your_api_key_here
```

The application uses the environment variable to authenticate with the Groq API.

### `.env.example`

For GitHub, provide:

```env
GROQ_API_KEY=your_api_key_here
```

Never commit your actual API key.


# ▶️ Running the Application

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

Open the URL in your browser.


# 🔌 API Endpoints

CulinaVision AI exposes REST API endpoints through FastAPI.

| MethodEndpointDescription |                          |                                    |
| ------------------------- | ------------------------ | ---------------------------------- |
| `GET`                     | `/`                      | Loads the web application          |
| `POST`                    | `/predict`               | Uploads image and generates recipe |
| `GET`                     | `/recipes`               | Retrieves all saved recipes        |
| `GET`                     | `/recipes/{id}`          | Retrieves a specific recipe        |
| `GET`                     | `/favorites`             | Retrieves favorite recipes         |
| `POST`                    | `/recipes/{id}/favorite` | Toggles favorite status            |
| `DELETE`                  | `/recipes/{id}`          | Deletes a recipe                   |


# 📡 Prediction Request

The `/predict` endpoint accepts:

```text
POST /predict
```

### Form Data

```text
file
spice_level
servings
diet
allergies
cooking_time
cuisine
```

Example:

```text
file = food.jpg
spice_level = Medium
servings = 2
diet = Vegetarian
allergies = peanuts, milk
cooking_time = Quick
cuisine = Indian
```


# 📤 Example Response

A successful prediction returns structured information similar to:

```json
{
    "id": 1,
    "filename": "food.jpg",
    "dish": "Pizza",
    "confidence": 0.92,
    "ingredients": [
        "Flour",
        "Tomato",
        "Cheese",
        "Olive Oil"
    ],
    "recipe": {
        "dish_name": "Vegetable Pizza",
        "nutrition": {
            "calories": 420,
            "protein_g": 18,
            "carbohydrates_g": 52,
            "fat_g": 16
        },
        "timing": {
            "prep_minutes": 15,
            "cook_minutes": 25,
            "total_minutes": 40
        },
        "difficulty": "Easy",
        "health_insights": [],
        "allergy_warnings": [],
        "ingredients": [],
        "instructions": [],
        "chef_tips": []
    }
}
```


# 🗄️ Database

CulinaVision AI uses **SQLite** to store generated recipes.

The database stores:

```text
Recipe ID
Dish Name
Confidence
Ingredients
Recipe
Preferences
Favorite Status
Created Date
```

The recipe and preference objects are stored as JSON inside the SQLite database.


# 🧩 Core Application Modules

### `main.py`

Handles:

* FastAPI application
* Routes
* Image uploads
* User preferences
* API responses
* Error handling
* Database integration


### `pipeline.py`

Coordinates the complete AI workflow:

```text
Food Validation
      ↓
Food Classification
      ↓
Ingredient Estimation
      ↓
Recipe Generation
```


### `food_validator.py`

Determines whether the uploaded image appears to contain food.


### `food_classifier.py`

Identifies the likely food/dish using the Hugging Face food classification model.


### `ingredient_estimator.py`

Provides estimated ingredients based on the detected dish.


### `recipe_generator.py`

Communicates with Groq and GPT-OSS 120B to generate the structured recipe.


### `recipe_preferences.py`

Manages:

* Spice level
* Servings
* Diet
* Allergies
* Cooking time
* Cuisine


### `recipe_database.py`

Handles SQLite operations including:

* Insert recipe
* Retrieve recipes
* Retrieve individual recipe
* Retrieve favorites
* Toggle favorites
* Delete recipes


# 🖥️ User Interface

The web interface provides a complete workflow from image upload to recipe history.

### Main Interface

```text
Upload Food Image
        ↓
Customize Recipe
        ↓
Generate Recipe
        ↓
View AI Results
        ↓
Save Automatically
        ↓
Recipe History
```

The frontend communicates with the FastAPI backend using JavaScript `fetch()` requests.


# 🛡️ Error Handling

CulinaVision AI handles several common errors.

### Invalid File

```text
Please upload a valid image file.
```

### Large File

```text
Image size must be less than 10MB.
```

### Non-Food Image

```text
The uploaded image does not appear to contain food.
Please upload a clear food image.
```

### Recipe Generation Error

```text
Unable to generate the recipe.
```

### Recipe Not Found

```text
Recipe not found.
```

### Database / History Error

The application provides appropriate error feedback if recipe history cannot be loaded.


# 🧪 Testing

The project includes a `tests/` directory for application testing.

Current database testing can be performed using:

```bash
python tests/test_database.py
```

Additional automated tests can be added as the project evolves.


# 🔒 Security Considerations

The following files should not be committed to GitHub:

```text
.env
venv/
__pycache__/
*.pyc
data/*.db
assets/uploads/*
```

The Groq API key must always remain in an environment variable.

Example:

```env
GROQ_API_KEY=your_api_key_here
```


# ⚠️ Limitations

CulinaVision AI currently has some limitations.

### 1. Ingredient Estimation

The ingredient estimator provides likely ingredients based on the detected dish.

It does not perform pixel-level ingredient detection or guarantee exact ingredient quantities.


### 2. Nutrition Accuracy

Nutrition values are AI-generated estimates.

They should not be considered medically or nutritionally exact.


### 3. Food Classification

The classification result depends on the capabilities and classes supported by the selected food model.

Images with:

* Poor lighting
* Unusual presentation
* Multiple dishes
* Low resolution
* Obstructed food

may produce less accurate predictions.


### 4. AI-Generated Recipes

Generated recipes may occasionally contain inaccurate or unsuitable suggestions.

Users should verify ingredients and cooking instructions, especially when allergies or dietary restrictions are involved.


### 5. Local SQLite Storage

The current implementation uses SQLite for simplicity and local development.

For a large-scale production deployment, a server-based database such as PostgreSQL would be more suitable.


# 🚀 Future Enhancements

Possible future improvements include:

* 🎯 Fine-tuned custom food classification model
* 🥕 More advanced visual ingredient detection
* 📏 Automatic ingredient quantity estimation
* 📊 More detailed nutrition analysis
* 🌐 Multi-language recipe generation
* 🎤 Voice-based recipe interaction
* 🛒 Smart grocery list generation
* 🔄 Ingredient substitution recommendations
* 👤 User accounts and authentication
* ☁️ Cloud database integration
* 📱 Mobile application
* 🧠 Personalized recipe recommendations
* ⭐ Recipe rating system
* 📈 User nutrition dashboard
* 🗺️ Regional cuisine expansion
* 📷 Multi-food image analysis
* 🧾 Recipe export to PDF
* 🌍 Cloud deployment


# 🌐 Deployment

The application can be deployed as a FastAPI web application using a cloud hosting platform.

A production deployment can follow:

```text
GitHub
   ↓
Cloud Hosting
   ↓
FastAPI
   ↓
Hugging Face Models
   ↓
Groq API
   ↓
Database
```

For production deployment, environment variables should be configured through the hosting provider rather than uploading `.env`.


# 🔮 Project Workflow Summary

```text
                 USER
                  │
                  ▼
        ┌───────────────────┐
        │ Upload Food Image │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Food Validation   │
        └─────────┬─────────┘
                  │
            Valid Food
                  │
                  ▼
        ┌───────────────────┐
        │ Food Classification│
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Ingredient        │
        │ Estimation        │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ User Preferences  │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │   GPT-OSS 120B   │
        │   via Groq API    │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Recipe Intelligence│
        ├───────────────────┤
        │ Nutrition         │
        │ Timing            │
        │ Instructions      │
        │ Health Insights   │
        │ Allergy Warnings  │
        │ Chef Tips         │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ SQLite Database   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Recipe History    │
        │ Favorites         │
        │ View / Delete     │
        └───────────────────┘
```

# 🧰 Requirements

Main dependencies include:

```text
FastAPI
Uvicorn
Python-Multipart
Pillow
OpenCV
PyTorch
TorchVision
Transformers
Python-Dotenv
Groq
```

Install all dependencies using:

```bash
pip install -r requirements.txt
```


# 📊 Project Highlights

| AreaImplementation  |                             |
| ------------------- | --------------------------- |
| Image Processing    | Pillow, OpenCV              |
| Food Validation     | Hugging Face Vision Model   |
| Food Classification | Hugging Face `nateraw/food` |
| Deep Learning       | PyTorch                     |
| Generative AI       | GPT-OSS 120B                |
| LLM Inference       | Groq API                    |
| Backend             | FastAPI                     |
| Frontend            | HTML, CSS, JavaScript       |
| Database            | SQLite                      |
| Data Format         | JSON                        |
| API Communication   | REST                        |
| Development         | Python, VS Code, Git        |


# 🎯 Objectives

The main objectives of CulinaVision AI are:

1. To analyze food images using computer vision.
2. To identify the likely dish from an uploaded image.
3. To estimate the ingredients associated with the detected dish.
4. To generate personalized recipes using generative AI.
5. To adapt recipes according to user dietary preferences.
6. To provide approximate nutrition information.
7. To provide cooking time and difficulty information.
8. To provide allergy-related warnings.
9. To provide health insights and chef recommendations.
10. To maintain a persistent recipe history.
11. To allow users to favorite and manage their generated recipes.


# 💡 Why CulinaVision AI?

Traditional recipe applications generally require users to search manually for a dish.

CulinaVision AI introduces an image-driven approach:

```text
Traditional Approach:

User → Search Dish → Select Recipe → Customize


CulinaVision AI:

Food Image → AI Analysis → Dish Identification
          → Ingredient Estimation
          → Personalized Recipe
          → Nutrition & Health Insights
          → Recipe History
```

This makes recipe discovery more interactive, intelligent, and personalized.


# 🏆 Project Highlights

### 🤖 AI-Powered

Combines computer vision and generative AI in a single application.

### 📸 Image-Based

Users can start the recipe-generation process simply by uploading a food image.

### 🎯 Personalized

Recipes are generated according to individual preferences.

### 🥗 Recipe Intelligence

Provides nutrition, timing, health insights, allergy warnings, and chef tips.

### 💾 Persistent Storage

Generated recipes are automatically stored for future access.

### ❤️ Recipe Management

Users can favorite, view, filter, and delete saved recipes.

### ⚡ Modern API Architecture

FastAPI provides a lightweight REST backend connecting the AI pipeline with the frontend.


# 👨‍💻 Author

**Raga Sandhiya R**


# 📜 License

This project is licensed under the **MIT License**.


# ⭐ Acknowledgements

This project makes use of:

* PyTorch
* Hugging Face Transformers
* Hugging Face pretrained models
* FastAPI
* Groq API
* GPT-OSS 120B
* SQLite


## ⭐ If You Like This Project

If you find **CulinaVision AI** interesting, consider giving the repository a ⭐ on GitHub!

```
```
