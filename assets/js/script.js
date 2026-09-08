const imageInput = document.getElementById("imageInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");
const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeBtn = document.getElementById("removeBtn");

const generateBtn = document.getElementById("generateBtn");
const generateAgainBtn = document.getElementById("generateAgainBtn");

const loadingSection = document.getElementById("loadingSection");
const resultsSection = document.getElementById("resultsSection");

const ingredientsList = document.getElementById("ingredientsList");
const dishName = document.getElementById("dishName");
const confidence = document.getElementById("confidence");
const recipeContent = document.getElementById("recipeContent");

const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

const historyGrid = document.getElementById("historyGrid");
const historyEmpty = document.getElementById("historyEmpty");

const allRecipesBtn = document.getElementById("allRecipesBtn");
const favoriteRecipesBtn = document.getElementById("favoriteRecipesBtn");

const spiceLevel = document.getElementById("spiceLevel");
const servings = document.getElementById("servings");
const diet = document.getElementById("diet");
const cookingTime = document.getElementById("cookingTime");
const cuisine = document.getElementById("cuisine");
const allergies = document.getElementById("allergies");

let selectedFile = null;
let currentHistoryFilter = "all";

function showError(message) {
    errorText.textContent = message;
    errorMessage.hidden = false;
}

function hideError() {
    errorMessage.hidden = true;
}

function validateFile(file) {
    if (!file) {
        return false;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        showError(
            "Please upload a JPG, JPEG, PNG, or WEBP image."
        );
        return false;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError(
            "Image size must be less than 10MB."
        );
        return false;
    }

    return true;
}

function handleFile(file) {
    hideError();

    if (!validateFile(file)) {
        return;
    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = function (event) {
        imagePreview.src = event.target.result;

        previewContainer.hidden = false;
        dropZone.hidden = true;

        generateBtn.disabled = false;
    };

    reader.readAsDataURL(file);
}

browseBtn.addEventListener(
    "click",
    function () {
        imageInput.click();
    }
);

imageInput.addEventListener(
    "change",
    function () {
        if (
            this.files &&
            this.files.length > 0
        ) {
            handleFile(this.files[0]);
        }
    }
);

dropZone.addEventListener(
    "dragover",
    function (event) {
        event.preventDefault();

        dropZone.classList.add("dragover");
    }
);

dropZone.addEventListener(
    "dragleave",
    function () {
        dropZone.classList.remove("dragover");
    }
);

dropZone.addEventListener(
    "drop",
    function (event) {
        event.preventDefault();

        dropZone.classList.remove("dragover");

        if (
            event.dataTransfer.files &&
            event.dataTransfer.files.length > 0
        ) {
            handleFile(
                event.dataTransfer.files[0]
            );
        }
    }
);

function resetResults() {
    resultsSection.hidden = true;

    ingredientsList.innerHTML = "";
    recipeContent.innerHTML = "";

    dishName.textContent = "Unknown Dish";
    confidence.textContent = "N/A";
}

removeBtn.addEventListener(
    "click",
    function () {
        selectedFile = null;

        imageInput.value = "";
        imagePreview.src = "";

        previewContainer.hidden = true;
        dropZone.hidden = false;

        generateBtn.disabled = true;

        resetResults();
        hideError();
    }
);

function getPreferences() {
    const allergyText = allergies.value.trim();

    const allergyList = allergyText
        ? allergyText
            .split(",")
            .map(
                item => item.trim()
            )
            .filter(
                item => item.length > 0
            )
        : [];

    return {
        spice_level: spiceLevel.value,
        servings: Number(servings.value),
        diet: diet.value,
        allergies: allergyList,
        cooking_time: cookingTime.value,
        cuisine: cuisine.value
    };
}

async function generateRecipe() {
    if (!selectedFile) {
        showError(
            "Please upload a food image first."
        );
        return;
    }

    hideError();

    loadingSection.hidden = false;
    resultsSection.hidden = true;

    generateBtn.disabled = true;

    const formData = new FormData();

    formData.append(
        "file",
        selectedFile
    );

    const preferences = getPreferences();

    formData.append(
        "spice_level",
        preferences.spice_level
    );

    formData.append(
        "servings",
        preferences.servings
    );

    formData.append(
        "diet",
        preferences.diet
    );

    formData.append(
        "allergies",
        preferences.allergies.join(",")
    );

    formData.append(
        "cooking_time",
        preferences.cooking_time
    );

    formData.append(
        "cuisine",
        preferences.cuisine
    );

    try {
        const response = await fetch(
            "/predict",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                data.error ||
                "Unable to generate recipe."
            );
        }

        displayResults(data);

        await loadRecipeHistory();

    } catch (error) {
        console.error(
            "Generation Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while generating the recipe."
        );

    } finally {
        loadingSection.hidden = true;

        generateBtn.disabled = !selectedFile;
    }
}

function displayResults(data) {
    const dish =
        data.dish ||
        data.recipe?.dish_name ||
        "Unknown Dish";

    const score =
        typeof data.confidence === "number"
            ? data.confidence
            : null;

    dishName.textContent =
        formatDishName(dish);

    confidence.textContent =
        score !== null
            ? `${(score * 100).toFixed(2)}%`
            : "N/A";

    ingredientsList.innerHTML = "";

    const ingredients =
        Array.isArray(data.ingredients)
            ? data.ingredients
            : [];

    if (ingredients.length === 0) {
        const item =
            document.createElement("li");

        item.textContent =
            "No ingredient information available.";

        ingredientsList.appendChild(item);

    } else {
        ingredients.forEach(
            function (ingredient) {
                const item =
                    document.createElement("li");

                item.textContent =
                    formatIngredient(ingredient);

                ingredientsList.appendChild(item);
            }
        );
    }

    recipeContent.innerHTML =
        displayRecipe(data.recipe);

    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function displayRecipe(recipe) {
    if (!recipe) {
        return `
            <p>
                No recipe information available.
            </p>
        `;
    }

    if (typeof recipe === "string") {
        return formatTextAsHTML(recipe);
    }

    if (typeof recipe !== "object") {
        return `
            <p>
                ${escapeHTML(String(recipe))}
            </p>
        `;
    }

    let html = "";

    if (recipe.timing) {
        html += `
            <div class="recipe-info">
                <div class="info-item">
                    <span>
                        ⏱️ Prep
                    </span>
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.timing.prep_minutes ??
                                "N/A"
                            )
                        )} min
                    </strong>
                </div>

                <div class="info-item">
                    <span>
                        🔥 Cook
                    </span>
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.timing.cook_minutes ??
                                "N/A"
                            )
                        )} min
                    </strong>
                </div>

                <div class="info-item">
                    <span>
                        ⏳ Total
                    </span>
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.timing.total_minutes ??
                                "N/A"
                            )
                        )} min
                    </strong>
                </div>

                <div class="info-item">
                    <span>
                        📊 Difficulty
                    </span>
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.difficulty ||
                                "Easy"
                            )
                        )}
                    </strong>
                </div>
            </div>
        `;
    }

    if (recipe.nutrition) {
        html += `
            <h3>
                🥗 Nutrition Per Serving
            </h3>

            <div class="nutrition-grid">
                <div class="nutrition-card">
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.nutrition.calories ??
                                "N/A"
                            )
                        )}
                    </strong>

                    <span>
                        Calories
                    </span>
                </div>

                <div class="nutrition-card">
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.nutrition.protein_g ??
                                "N/A"
                            )
                        )}g
                    </strong>

                    <span>
                        Protein
                    </span>
                </div>

                <div class="nutrition-card">
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.nutrition.carbohydrates_g ??
                                "N/A"
                            )
                        )}g
                    </strong>

                    <span>
                        Carbs
                    </span>
                </div>

                <div class="nutrition-card">
                    <strong>
                        ${escapeHTML(
                            String(
                                recipe.nutrition.fat_g ??
                                "N/A"
                            )
                        )}g
                    </strong>

                    <span>
                        Fat
                    </span>
                </div>
            </div>
        `;
    }

    if (
        Array.isArray(recipe.ingredients) &&
        recipe.ingredients.length
    ) {
        html += `
            <h3>
                🛒 Ingredients
            </h3>

            <ul class="recipe-list">
        `;

        recipe.ingredients.forEach(
            function (ingredient) {
                html += `
                    <li>
                        ${escapeHTML(
                            formatIngredient(ingredient)
                        )}
                    </li>
                `;
            }
        );

        html += `
            </ul>
        `;
    }

    if (
        Array.isArray(recipe.instructions) &&
        recipe.instructions.length
    ) {
        html += `
            <h3>
                👨‍🍳 Instructions
            </h3>

            <div class="instructions">
        `;

        recipe.instructions.forEach(
            function (step, index) {
                html += `
                    <div class="recipe-step">
                        <span class="step-number">
                            ${index + 1}
                        </span>

                        <p>
                            ${escapeHTML(String(step))}
                        </p>
                    </div>
                `;
            }
        );

        html += `
            </div>
        `;
    }

    if (
        Array.isArray(recipe.health_insights) &&
        recipe.health_insights.length
    ) {
        html += `
            <h3>
                💡 Health Insights
            </h3>

            <ul class="recipe-list">
        `;

        recipe.health_insights.forEach(
            function (insight) {
                html += `
                    <li>
                        ${escapeHTML(String(insight))}
                    </li>
                `;
            }
        );

        html += `
            </ul>
        `;
    }

    if (
        Array.isArray(recipe.allergy_warnings) &&
        recipe.allergy_warnings.length
    ) {
        html += `
            <div class="allergy-warning">
                <h3>
                    ⚠️ Allergy Information
                </h3>

                <ul>
        `;

        recipe.allergy_warnings.forEach(
            function (warning) {
                html += `
                    <li>
                        ${escapeHTML(String(warning))}
                    </li>
                `;
            }
        );

        html += `
                </ul>
            </div>
        `;
    }

    if (
        Array.isArray(recipe.chef_tips) &&
        recipe.chef_tips.length
    ) {
        html += `
            <h3>
                👨‍🍳 Chef Tips
            </h3>

            <ul class="recipe-list">
        `;

        recipe.chef_tips.forEach(
            function (tip) {
                html += `
                    <li>
                        ${escapeHTML(String(tip))}
                    </li>
                `;
            }
        );

        html += `
            </ul>
        `;
    }

    if (
        recipe.title &&
        !recipe.dish_name
    ) {
        html =
            `<h2>${escapeHTML(
                String(recipe.title)
            )}</h2>` +
            html;
    }

    if (recipe.description) {
        html =
            `<p>${escapeHTML(
                String(recipe.description)
            )}</p>` +
            html;
    }

    if (html) {
        return html;
    }

    return formatTextAsHTML(
        JSON.stringify(
            recipe,
            null,
            2
        )
    );
}

function formatIngredient(ingredient) {
    if (typeof ingredient === "string") {
        return ingredient;
    }

    if (
        ingredient &&
        typeof ingredient === "object"
    ) {
        if (
            ingredient.name &&
            ingredient.quantity
        ) {
            return `
                ${ingredient.name}
                — ${ingredient.quantity}
            `;
        }

        if (ingredient.name) {
            return ingredient.name;
        }

        return Object.values(ingredient)
            .join(" — ");
    }

    return String(ingredient);
}

function formatTextAsHTML(text) {
    const escaped =
        escapeHTML(String(text));

    const lines =
        escaped.split("\n");

    let html = "";
    let inList = false;

    lines.forEach(
        function (line) {
            const trimmed = line.trim();

            if (!trimmed) {
                if (inList) {
                    html += "</ul>";
                    inList = false;
                }

                return;
            }

            if (
                trimmed.startsWith("- ") ||
                trimmed.startsWith("• ")
            ) {
                if (!inList) {
                    html += "<ul>";
                    inList = true;
                }

                html += `
                    <li>
                        ${trimmed.substring(2)}
                    </li>
                `;

                return;
            }

            if (
                /^\d+\.\s/.test(trimmed)
            ) {
                if (inList) {
                    html += "</ul>";
                    inList = false;
                }

                html += `
                    <p>
                        ${trimmed}
                    </p>
                `;

                return;
            }

            if (
                trimmed.endsWith(":") &&
                trimmed.length < 80
            ) {
                if (inList) {
                    html += "</ul>";
                    inList = false;
                }

                html += `
                    <h3>
                        ${trimmed}
                    </h3>
                `;

                return;
            }

            if (inList) {
                html += "</ul>";
                inList = false;
            }

            html += `
                <p>
                    ${trimmed}
                </p>
            `;
        }
    );

    if (inList) {
        html += "</ul>";
    }

    return html;
}

function escapeHTML(value) {
    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function formatDishName(name) {
    return String(name)
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            function (letter) {
                return letter.toUpperCase();
            }
        );
}

async function loadRecipeHistory() {
    try {
        const response =
            await fetch("/recipes");

        if (!response.ok) {
            throw new Error(
                "Failed to load recipe history."
            );
        }

        const data =
            await response.json();

        const recipes =
            Array.isArray(data.recipes)
                ? data.recipes
                : [];

        displayHistory(recipes);

    } catch (error) {
        console.error(
            "History Error:",
            error
        );

        historyGrid.innerHTML = "";
        historyEmpty.hidden = false;

        historyEmpty.querySelector("h3").textContent =
            "Unable to load recipe history";

        historyEmpty.querySelector("p").textContent =
            "Please refresh the page and try again.";
    }
}

function displayHistory(recipes) {
    let filteredRecipes = recipes;

    if (
        currentHistoryFilter === "favorites"
    ) {
        filteredRecipes =
            recipes.filter(
                function (recipe) {
                    return Boolean(recipe.favorite);
                }
            );
    }

    historyGrid.innerHTML = "";

    if (filteredRecipes.length === 0) {
        historyEmpty.hidden = false;

        if (
            currentHistoryFilter === "favorites"
        ) {
            historyEmpty.querySelector("h3").textContent =
                "No favorite recipes";

            historyEmpty.querySelector("p").textContent =
                "Favorite a recipe and it will appear here.";
        } else {
            historyEmpty.querySelector("h3").textContent =
                "No recipes yet";

            historyEmpty.querySelector("p").textContent =
                "Generate your first recipe and it will appear here.";
        }

        return;
    }

    historyEmpty.hidden = true;

    filteredRecipes.forEach(
        function (recipe) {
            historyGrid.appendChild(
                createHistoryCard(recipe)
            );
        }
    );
}

function createHistoryCard(recipe) {
    const card =
        document.createElement("article");

    card.className = "history-card";

    const favorite =
        Boolean(recipe.favorite);

    const dish =
        recipe.dish_name ||
        recipe.dish ||
        "Unknown Dish";

    const ingredients =
        Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : [];

    const ingredientText =
        ingredients
            .slice(0, 4)
            .map(formatIngredient)
            .join(" • ");

    const confidenceValue =
        typeof recipe.confidence === "number"
            ? `${(
                recipe.confidence * 100
            ).toFixed(1)}%`
            : "N/A";

    const date =
        formatHistoryDate(recipe.created_at);

    card.innerHTML = `
        <div class="history-card-top">
            <div class="history-card-icon">
                🍽️
            </div>

            <div class="history-card-actions">
                <button
                    type="button"
                    class="history-action favorite ${favorite ? "active" : ""}"
                    title="${
                        favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }"
                >
                    ${
                        favorite
                            ? "❤️"
                            : "♡"
                    }
                </button>

                <button
                    type="button"
                    class="history-action delete"
                    title="Delete recipe"
                >
                    🗑️
                </button>
            </div>
        </div>

        <h3>
            ${escapeHTML(
                formatDishName(dish)
            )}
        </h3>

        <div class="history-card-date">
            ${escapeHTML(date)}
        </div>

        <div class="history-ingredients">
            ${escapeHTML(
                ingredientText ||
                "Ingredients not available"
            )}
        </div>

        <div class="history-card-info">
            <span>
                Confidence
            </span>

            <strong>
                ${confidenceValue}
            </strong>
        </div>

        <button
            type="button"
            class="history-card-open"
        >
            View Recipe
        </button>
    `;

    const favoriteButton =
        card.querySelector(".favorite");

    const deleteButton =
        card.querySelector(".delete");

    const openButton =
        card.querySelector(".history-card-open");

    favoriteButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            toggleRecipeFavorite(recipe.id);
        }
    );

    deleteButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            deleteRecipe(recipe.id);
        }
    );

    openButton.addEventListener(
        "click",
        function () {
            openHistoryRecipe(recipe.id);
        }
    );

    card.addEventListener(
        "click",
        function () {
            openHistoryRecipe(recipe.id);
        }
    );

    return card;
}

async function openHistoryRecipe(recipeId) {
    try {
        const response =
            await fetch(`/recipes/${recipeId}`);

        if (!response.ok) {
            const data =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                data.detail ||
                "Unable to open recipe."
            );
        }

        const recipe =
            await response.json();

        dishName.textContent =
            formatDishName(
                recipe.dish_name ||
                recipe.dish ||
                "Unknown Dish"
            );

        confidence.textContent =
            typeof recipe.confidence === "number"
                ? `${(
                    recipe.confidence * 100
                ).toFixed(2)}%`
                : "N/A";

        ingredientsList.innerHTML = "";

        const ingredients =
            Array.isArray(recipe.ingredients)
                ? recipe.ingredients
                : [];

        if (ingredients.length === 0) {
            const item =
                document.createElement("li");

            item.textContent =
                "No ingredient information available.";

            ingredientsList.appendChild(item);

        } else {
            ingredients.forEach(
                function (ingredient) {
                    const item =
                        document.createElement("li");

                    item.textContent =
                        formatIngredient(ingredient);

                    ingredientsList.appendChild(item);
                }
            );
        }

        recipeContent.innerHTML =
            displayRecipe(recipe.recipe);

        resultsSection.hidden = false;

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error(
            "Open Recipe Error:",
            error
        );

        showError(
            error.message ||
            "Unable to open this recipe."
        );
    }
}

async function toggleRecipeFavorite(recipeId) {
    try {
        const response =
            await fetch(
                `/recipes/${recipeId}/favorite`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            const data =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                data.detail ||
                "Unable to update favorite."
            );
        }

        await loadRecipeHistory();

    } catch (error) {
        console.error(
            "Favorite Error:",
            error
        );

        showError(
            error.message ||
            "Unable to update favorite."
        );
    }
}

async function deleteRecipe(recipeId) {
    const confirmed =
        window.confirm(
            "Are you sure you want to delete this recipe?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `/recipes/${recipeId}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {
            const data =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                data.detail ||
                "Unable to delete recipe."
            );
        }

        await loadRecipeHistory();

    } catch (error) {
        console.error(
            "Delete Error:",
            error
        );

        showError(
            error.message ||
            "Unable to delete recipe."
        );
    }
}

function formatHistoryDate(dateValue) {
    if (!dateValue) {
        return "Recently generated";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Recently generated";
    }

    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

allRecipesBtn.addEventListener(
    "click",
    function () {
        currentHistoryFilter = "all";

        allRecipesBtn.classList.add("active");
        favoriteRecipesBtn.classList.remove("active");

        loadRecipeHistory();
    }
);

favoriteRecipesBtn.addEventListener(
    "click",
    function () {
        currentHistoryFilter = "favorites";

        favoriteRecipesBtn.classList.add("active");
        allRecipesBtn.classList.remove("active");

        loadRecipeHistory();
    }
);

generateBtn.addEventListener(
    "click",
    generateRecipe
);

generateAgainBtn.addEventListener(
    "click",
    function () {
        selectedFile = null;

        imageInput.value = "";
        imagePreview.src = "";

        previewContainer.hidden = true;
        dropZone.hidden = false;

        generateBtn.disabled = true;

        resetResults();
        hideError();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);

loadRecipeHistory();