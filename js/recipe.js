$(document).ready(function () { 
  // Malaysian recipes API
  const apiURL = "https://www.themealdb.com/api/json/v1/1/filter.php?a=Malaysian";

  // Load recipes on page load
  loadRecipes();

  function loadRecipes() {
    $("#recipe-list").html(`
      <div class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-utensils fa-spin"></i>
        </div>
        <p>Loading delicious Malaysian recipes...</p>
      </div>
    `);

    $.getJSON(apiURL)
      .done(function(data) {
        if (data.meals && data.meals.length > 0) {
          fetchRecipesWithCategories(data.meals);
        } else {
          displayNoRecipes();
        }
      })

      .fail(function(error) {
        console.error('Failed to load recipes:', error);
        displayError();
      });
  }

  function fetchRecipesWithCategories(meals) {
    const promises = meals.map(meal => {
      return $.getJSON(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
        .then(function(detailData) {
          return detailData.meals && detailData.meals[0] ? detailData.meals[0] : meal;
        })
        .catch(() => meal);
    });

    Promise.all(promises).then(function(recipesWithCategories) {
      displayRecipes(recipesWithCategories);
      restoreFavorites();
      SearchRecipe();
    });
  }

  function displayRecipes(meals) {
    const $recipeList = $("#recipe-list");
    $recipeList.empty();

    meals.forEach((meal, index) => {
      const $card = createRecipeCard(meal, index);
      $recipeList.append($card);
    });
  }

  function createRecipeCard(meal, index) {
    const category = meal.strCategory || 'Malaysian';
    const isFavorited = localStorage.getItem(`favorite-${meal.idMeal}`) === 'true';

    const $card = $(`
      <div class="recipe-card" style="animation-delay: ${index * 0.1}s">
        <div class="recipe-image">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
          <button class="btn-favorite ${isFavorited ? 'favorited' : ''}" data-meal-id="${meal.idMeal}">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="recipe-content">
          <h3>${meal.strMeal}</h3>
          <span class="recipe-category"><i class="fas fa-utensils"></i> ${category}</span>
          <div class="recipe-actions">
            <button class="btn-view" data-meal-id="${meal.idMeal}">
              <i class="fas fa-book-open"></i> View Recipe
            </button>
          </div>
        </div>
      </div>
    `);

    // View recipe button
    $card.find('.btn-view').on('click', function(e) {
      e.preventDefault();
      const mealId = $(this).data('meal-id');
      window.location.href = `subRecipe.html?id=${mealId}`;
    });

    // Favorite toggle
    $card.find('.btn-favorite').on('click', function(e) {
      e.preventDefault();
      const mealId = $(this).data('meal-id');
      toggleFavorite($(this), mealId);
    });

    return $card;
  }

  // Toggle favorite and store in localStorage
  function toggleFavorite($button, mealId) {
    const key = `favorite-${mealId}`;

    if (localStorage.getItem(key) === 'true') {
      localStorage.removeItem(key);
      $button.removeClass('favorited');
    } else {
      localStorage.setItem(key, 'true');
      $button.addClass('favorited');
    }
  }

  // Restore favorite status (from local storage)
  function restoreFavorites() {
    $('.btn-favorite').each(function() {
      const mealId = $(this).data('meal-id');

      if (localStorage.getItem(`favorite-${mealId}`) === 'true') {
        $(this).addClass('favorited');
      }
    });
  }

  function displayNoRecipes() {
    $("#recipe-list").html(`
      <div class="no-results">
        <i class="fas fa-utensils"></i>
        <h3>No Recipes Found</h3>
        <p>We couldn't find any Malaysian recipes at the moment.</p>
        <button class="btn-retry" onclick="location.reload()"><i class="fas fa-refresh"></i> Try Again</button>
      </div>
    `);
  }

  function displayError() {
    $("#recipe-list").html(`
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Oops! Something went wrong</h3>
        <p>We couldn't load the recipes right now. Please check your internet connection and try again.</p>
        <button class="btn-retry" onclick="location.reload()"><i class="fas fa-refresh"></i> Reload Page</button>
      </div>
    `);
  }

  // Search bar function
  function SearchRecipe() {
    $('#recipe-search').on('input', function() {
      const searchWord = $(this).val().toLowerCase().trim();
      const $cards = $('.recipe-card');
      $cards.each(function() {
        const name = $(this).find('h3').text().toLowerCase();
        $(this).toggle(name.includes(searchWord));
      });

      // Show no result message
      if ($cards.filter(':visible').length === 0 && searchWord !== '') {
        $('#recipe-list').append(`
          <div class="no-search-results">
            <i class="fas fa-search"></i>
            <h3>No recipes found for "${searchWord}"</h3>
            <p>Try searching for something else or browse all our Malaysian recipes.</p>
          </div>
        `);
      }
    });
  }
});
