// ../js/restaurant.js
// Call the function
$(document).ready(function () {
  loadRestaurantArticle();
  loadFunFacts();
});

// Populate Restaurant Articles
function loadRestaurantArticle() {
  $.getJSON('../restaurant_reviews.json')
    .done(function (data) {
      const $container = $('.restaurant-articles');
      if (!$container.length || !data.reviews) return;

      $container.empty();

      data.reviews.forEach(review => {
        $container.append(createRestaurantArticle(review));
      });
    })
    .fail(function () {
      console.error('Failed to load restaurant articles');
      $('.restaurant-articles').append('<p>No articles available at the moment.</p>');
    });
}

function createRestaurantArticle(review) {
  const $card = $(`
        <article class="restaurant-card">
            <img src="${review.heroImg}" alt="${review.titleMain}">
            <h3>${review.titleSub}</h3>
            <p>${review.desc}</p>
            <a href="./review.html?food=${review.id}" class="btn btn-sm btn-primary">Read More</a>
        </article>
    `);

  // Make the whole card clickable
  $card.click(() => window.location.href = `./review.html?food=${review.id}`);
  return $card;
}

// Load Fun Facts from JSON
function loadFunFacts() {
  $.getJSON('../restaurant_reviews.json')
    .done(function (data) {
      const $funFacts = $('#fun-facts');
      if (!$funFacts.length || !data.funfacts) return;

      $funFacts.empty();
      
      data.funfacts.forEach(function (fact) {
        const factCard = `
          <li class="fact-card mb-2 p-2 shadow-sm rounded">
            <i class="fa-solid fa-lightbulb me-2"></i>${fact}
          </li>
        `;
        $funFacts.append(factCard);
      });
    })
    .fail(function () {
      console.error('Failed to load fun facts');
    });
}

// Animate cards on scroll
const $cards = $('.restaurant-card, .fact-card');
$cards.css({ opacity: 0, transform: 'translateY(12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      $(entry.target).css({ opacity: 1, transform: 'translateY(0)' });
    }
  });
}, { threshold: 0.1 });

$cards.each(function () {
  observer.observe(this);
});