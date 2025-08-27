$(document).ready(async function () {
    // Get mealId from the URL (example: subRecipe.html?id=52772)
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get('id'); 

    if (!mealId) {
        handleError("No recipe ID found in URL");
        return;
    }

    const apiURL = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;

    const $loadingSpinner = $('#loading-spinner');

    try {
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!data.meals || data.meals.length === 0) throw new Error('Recipe not found');

        const meal = data.meals[0];

        // Hide loading spinner with animation
        setTimeout(() => {
            $loadingSpinner.addClass('hide');
            setTimeout(() => {
                $loadingSpinner.hide();
            }, 300);
        }, 800);

        populateHeroSection(meal);
        populateIngredients(meal);
        populateInstructions(meal);
        setupExternalLinks(meal);
        addSmoothScrolling();

        setTimeout(() => addScrollAnimations(), 1000);

    } catch (error) {
        console.error('Error fetching recipe:', error);
        handleError(error);
    }
});


function populateHeroSection(meal) {
    $('#recipe-title').text(meal.strMeal);
    $('#recipe-category').text(meal.strCategory);

    const $recipeImage = $('#recipe-image');
    $recipeImage.attr('src', meal.strMealThumb).attr('alt', meal.strMeal);

    $recipeImage.css({ opacity: 0, transition: 'opacity 0.5s ease' });
    $recipeImage.on('load', function () {
        $(this).css('opacity', 1);
    });
}

function populateIngredients(meal) {
    const $ingredientsList = $('#recipe-ingredients');
    if ($ingredientsList.length === 0) {
        console.error('Ingredients list element not found');
        return;
    }

    $ingredientsList.empty();

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== '') {
            const measureText = measure && measure.trim() !== '' ? measure.trim() : '';
            const $li = $('<li>').html(`<strong>${ingredient}</strong>${measureText ? ` - ${measureText}` : ''}`);
            $ingredientsList.append($li);
        }
    }

    console.log('Ingredients populated successfully');
}

function populateInstructions(meal) {
    const $instructionsContainer = $('#recipe-instructions');
    if ($instructionsContainer.length === 0) {
        console.error('Instructions container element not found');
        return;
    }

    $instructionsContainer.empty();

    const steps = meal.strInstructions.split(/\r?\n/).filter(step => step.trim() !== '');

    $.each(steps, function (index, stepText) {
        const $stepDiv = $(`
            <div class="instruction-step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <h5>Step ${index + 1}</h5>
                    <p>${stepText.trim()}</p>
                </div>
            </div>
        `);

        $stepDiv.css({ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease' });
        $instructionsContainer.append($stepDiv);

        setTimeout(() => {
            $stepDiv.css({ opacity: 1, transform: 'translateY(0)' });
        }, index * 100);
    });

    console.log('Instructions populated successfully');
}

function setupExternalLinks(meal) {
    const $youtubeLink = $('#recipe-youtube');
    if (meal.strYoutube && meal.strYoutube.trim() !== '') {
        $youtubeLink.attr('href', meal.strYoutube).css('display', 'inline-flex');
    } else {
        $youtubeLink.hide();
    }

    const $sourceLink = $('#recipe-source');
    if (meal.strSource && meal.strSource.trim() !== '') {
        $sourceLink.attr('href', meal.strSource).css('display', 'inline-flex');
    } else {
        $sourceLink.hide();
    }
}

function addSmoothScrolling() {
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 600);
        }
    });
}

function handleError(error) {
    $('#loading-spinner').hide();

    $('#recipe-title').text('Failed to Load Recipe');
    $('#recipe-category').text('Error');

    const $errorContainer = $(`
        <div class="alert alert-danger mt-4">
            <h4><i class="fas fa-exclamation-triangle"></i> Oops! Something went wrong</h4>
            <p>We couldn't load the recipe you're looking for. This might be due to:</p>
            <ul>
                <li>Network connection issues</li>
                <li>The recipe service is temporarily unavailable</li>
                <li>The recipe might have been moved or removed</li>
            </ul>
            <p>Please try refreshing the page or <a href="/html/recipe.html">browse other recipes</a>.</p>
        </div>
    `);

    $('.recipe-hero').after($errorContainer);
    console.error('Recipe loading error:', error);
}

function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('animate-in');
            }
        });
    }, observerOptions);

    $('.ingredients-card, .instruction-step, .recipe-resources, .recipe-tips').each(function () {
        observer.observe(this);
    });
}
