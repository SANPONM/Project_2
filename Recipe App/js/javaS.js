const apiKey = "d0722ba73ffb488c98e6cbe3d52e43b3";
const searchInput = document.querySelector("#searchInput");
const recipeGrid = document.querySelector("#recipeGrid");
const recipeModal = document.querySelector("#recipeModal");
const recipeDetails = document.querySelector("#recipeDetails");
const closeButton = document.querySelector(".close-button");
const favoritesGrid = document.querySelector("#favoritesGrid");
const images = document.querySelector("img");

searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query.length > 2) {
        const recipes = await searchRecipes(query);
        displayRecipes(recipes);
    }
});

async function searchRecipes(query) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=12&apiKey=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("API:", data);

        if (!Array.isArray(data.results)) {
            console.error("Error from data:", data);
            return [];
        }

        return data.results;
    } catch (error) {
        console.error("Error in API:", error);
        return [];
    }
}

function displayRecipes(recipes) {
    recipeGrid.innerHTML = "";
    localStorage.setItem("lastSearchResults", JSON.stringify(recipes));

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    recipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        const isFavorite = favorites.includes(recipe.id);

        recipeCard.innerHTML = `
            <div class="image-container">
                <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
                <i class='bx bx-plus-circle view-icon' onclick="showRecipeDetails(${recipe.id}, this.parentNode)" title="View Recipe"></i>
                <i class='bx ${isFavorite ? "bxs-heart" : "bx-heart"} favorite-icon' onclick="toggleFavorite(${recipe.id})" title="Add to Favorites"></i>
            </div>
            <h3>${recipe.title}</h3>
        `;

        recipeGrid.appendChild(recipeCard);
    });
}



async function showRecipeDetails(recipeId) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();

        const calories = recipe.nutrition && recipe.nutrition.nutrients && recipe.nutrition.nutrients[0]
            ? recipe.nutrition.nutrients[0].amount
            : "Недоступно";

        recipeDetails.innerHTML = `
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}">
            <p>${recipe.summary}</p>
            <ul>
                ${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join("")}
            </ul>
            <p><strong>Instructions:</strong> ${recipe.instructions || "Инструкции недоступны"}</p>
            <p><strong>Calories:</strong> ${calories}</p>
        `;

        recipeModal.style.display = "block";
    } catch (error) {
        console.error("Error:", error);
        recipeDetails.innerHTML = `<p>Error.</p>`;
        recipeModal.style.display = "block";
    }
}

function addToFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        displayFavorites();
    }
}
async function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesGrid.innerHTML = "";
    
    for (let recipeId of favorites) {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <div class="image-container">
                <img src="${recipe.image}" alt="${recipe.title}" class="favorite-image">
                <i class='bx bx-plus-circle view-icon' onclick="showRecipeDetails(${recipe.id})" title="View Recipe"></i>
                <i class='bx bxs-heart favorite-icon' onclick="toggleFavorite(${recipe.id})" title="Remove from Favorites"></i>
            </div>
            <h3>${recipe.title}</h3>
        `;

        favoritesGrid.appendChild(recipeCard);
    }
}

closeButton.addEventListener("click", () => {
    recipeModal.style.display = "none";
});

window.onload = () => {
    localStorage.removeItem("favorites");
    displayFavorites();
};

function toggleFavorite(recipeId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.includes(recipeId)) {
        favorites = favorites.filter(id => id !== recipeId);
    } else {
        favorites.push(recipeId);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
    displayRecipes(JSON.parse(localStorage.getItem("lastSearchResults")) || []);
}
