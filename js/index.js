// DOM Ready
$(function() {
    loadRestaurantReviews();
    loadRecipes();
    emailValidation();
});

// Global variables
let restaurantReviews = null;

// ------------------------------------------- Restaurant Reviews ------------------------------------------
function loadRestaurantReviews() {
    $.getJSON('../restaurant_reviews.json')
        .done(function(data) {
            restaurantReviews = data;
            displayRestaurantReviews();
            displayTrendingItems();
        })
        .fail(function() {
            console.error('Failed to load restaurant reviews');
            displayFallbackReviews();
        });
}

function displayRestaurantReviews() {
    const $container = $('#restaurant-container');
    if (!$container.length || !restaurantReviews) return;

    $container.empty();

    const restaurants = restaurantReviews.reviews.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    updateHeroSection(restaurants[0]);

    restaurants.slice(1, 4).forEach(restaurant => {
        $container.append(createRestaurantCard(restaurant));
    });
}

function createRestaurantCard(restaurant) {
    const $card = $(`
        <div class="restaurant-card">
            <div class="restaurant-image">
                <img src="${restaurant.heroImg}" alt="${restaurant.titleMain}">
            </div>
            <div class="restaurant-content">
                <h3>${restaurant.titleMain}</h3>
                <p>${restaurant.desc}</p>
                <div class="restaurant-meta">
                    <span class="author">${restaurant.editor}</span>
                    <span class="date">${restaurant.date}</span>
                    <span class="rating">${restaurant.rating}<i class="far fa-star"></i></span>
                </div>
            </div>
        <//div>
    `);

    $card.click(() => window.location.href = `./review.html?food=${restaurant.id}`);
    return $card;
}

function displayFallbackReviews() {
    const $container = $('#restaurant-container');
    if (!$container.length) return;

    $container.html(`
        <div class="error-message">
            <p>Sorry, we couldn't load restaurant reviews at the moment.</p>
            <p>Please try again later.</p>
        </div>
    `);
}

// -------------------------------------- Hero section --------------------------------------------
function updateHeroSection(restaurant) {
    const $hero = $('.hero-featured');
    if (!$hero.length) return;

    $hero.html(`
        <div class="featured-image">
            <img src="${restaurant.heroImg}" alt="${restaurant.titleMain}">
            <div class="featured-overlay">
                <span class="featured-category">Latest Article</span>
                <h1 class="featured-title">${restaurant.titleMain}</h1>
                <p class="featured-excerpt">${restaurant.desc}</p>
                <div class="featured-meta">
                    <span class="featured-author">${restaurant.editor}</span>
                    <span class="featured-date">${restaurant.date}</span>
                </div>
            </div>
        </div>
    `);

    $hero.css('cursor', 'pointer').off('click').on('click', () => {
        window.location.href = `./review.html?food=${restaurant.id}`;
    });
}

// ------------------------------------------- Recipes ------------------------------------------
function loadRecipes() {
    $.getJSON('https://www.themealdb.com/api/json/v1/1/filter.php?a=Malaysian').done(async function(data) {
            if (data.meals && data.meals.length > 0) {
                const selectedMeals = data.meals.slice(0, 4);

                const recipes = await Promise.all(selectedMeals.map(async meal => {
                    try {
                        const detailData = await $.getJSON(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                        return detailData.meals[0] || meal;
                    } catch (error) {
                        console.error(`Error fetching details for meal ${meal.idMeal}:`, error);
                        return meal;
                    }
                }));

                displayRecipes(recipes);
            } else {
                displayFallbackRecipes();
            }
        })
        .fail(function() {
            console.error('Failed to load Malaysian recipes');
            displayFallbackRecipes();
        });
}

function displayRecipes(recipes) {
    const $grid = $('.recipe-grid');
    if (!$grid.length) return;

    $grid.empty();
    recipes.forEach(recipe => $grid.append(createRecipeCard(recipe)));
}

function createRecipeCard(recipe) {
    const $card = $(`
        <div class="recipe-card">
            <div class="recipe-image">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            </div>
            <div class="recipe-content">
                <h4>${recipe.strMeal}</h4>
                <div class="recipe-meta">
                    <span><i class="fas fa-utensils"></i> ${recipe.strCategory}</span>
                </div>
            </div>
        </div>
    `);

    $card.click(() => window.location.href = `./subRecipe.html?id=${recipe.idMeal}`);
    return $card;
}

function displayFallbackRecipes() {
    const $grid = $('.recipe-grid');
    if (!$grid.length) return;

    $grid.html(`
        <div class="error-message">
            <p>Sorry, we couldn't load Malaysian recipes at the moment.</p>
            <p>Please try again later.</p>
        </div>
    `);
}

// ------------------------------------- Sidebar Email Form ---------------------------------------
function emailValidation() {
    const $form = $('#email-form');
    const $successMsg = $('#email-success');

    $form.on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.checkValidity()) {
            $(this).addClass('was-validated');
        } else {
            $successMsg.addClass('show');
            this.reset();
            $(this).removeClass('was-validated');

            setTimeout(() => $successMsg.removeClass('show'), 2000);
        }
    });
}

// -------------------------------------------- Trending Items ----------------------------------------
function displayTrendingItems() {
    const $trending = $('.trending-list');
    if (!restaurantReviews || !$trending.length) return;

    $trending.empty();

    const topRestaurants = restaurantReviews.reviews
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 3);

    topRestaurants.forEach((restaurant, index) => {
        const $item = $(`
            <div class="trending-item">
                <span class="trending-number">${index + 1}</span>
                <div class="trending-content">
                    <h5>${restaurant.titleMain}</h5>
                    <span class="trending-views">${restaurant.rating} <i class="far fa-star"></i></span>
                </div>
            </div>
        `);

        $item.click(() => window.location.href = `./review.html?food=${restaurant.id}`);
        $trending.append($item);
    });
}

// ---------------- Contribute Section ----------------
$(document).ready(function () {
    // Smooth scroll when clicking "Contribute" in navbar (if you add it later)
    $('a[href="#contribute"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#contribute').offset().top - 80
        }, 600);
    });

    // Animate contribute options when they scroll into view
    const contributeOptions = document.querySelectorAll('.contribute-option');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.2 });

    contributeOptions.forEach(option => observer.observe(option));
});

//----------------- Show Cookies -----------------------
$(document).ready(function () {
    showCookieConsent();
});
