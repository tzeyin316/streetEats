$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const food = urlParams.get("food") || "1"; // default review

  // fetch JSON 
  fetch("restaurant_reviews.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Loaded data:", data); 
      console.log("Looking for food ID:", food); 
      
      if (!data.reviews || !Array.isArray(data.reviews)) {
        console.error("Invalid reviews JSON structure");
        $(".review-container").html("<p>Invalid data structure.</p>");
        return;
      }

      // find id
      const review = data.reviews.find((r) => String(r.id) === String(food));
      console.log("Found review:", review); 
      
      if (!review) {
        $(".review-container").html("<p>No review found for ID: " + food + "</p>");
        return;
      }

      // Hero image
      if (review.heroImg) {
        $(".review-hero").css(
          "background-image",
          `url(${review.heroImg})`
        );
      }

      // Titles
      $("#review-title-main").text(review.titleMain || "");
      $("#review-title-sub").text(review.titleSub || "");

      // Set meta information
      $("#review-editor").text(review.editor || "Anonymous");
      $("#review-date").text(review.date || "-");
      
      // Set rating with stars
      const rating = review.rating || 0;
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      let starsHTML = '';
      
      for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
      }
      if (hasHalfStar) {
        starsHTML += '☆';
      }
      
      $("#review-stars").html(starsHTML);
      $("#review-rating").text(`(${rating}/5)`);
      
      // Set location with link
      const locationElement = $("#review-location");
      locationElement.text(review.location || "Unknown");
      locationElement.attr('href', review.locationLink || "#");

      // Review content container
      const $contentContainer = $("#review-content");
      $contentContainer.empty();

      // Content
      if (Array.isArray(review.content)) {
        review.content.forEach((item) => {
          if (\.(jpg|jpeg|png|gif)$/i.test(item)) {
            $contentContainer.append(
              `<img src="${item}" alt="${review.titleMain || "review"} image" class="img-fluid my-4 rounded">`
            );
          } else {
            $contentContainer.append(`<p>${item}</p>`);
          }
        });
      }
    })
    .catch((err) => {
      console.error("Failed to load reviews JSON:", err);
      $(".review-container").html("<p>Failed to load review data. Please check the console for details.</p>");
    });

});
