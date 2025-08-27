// ---------------------- Cookie -----------------------
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEqual = name + "=";
  const cookiesInfo = document.cookie.split(";");
  for (let i = 0; i < cookiesInfo.length; i++) {
    let cookieStr = cookiesInfo[i];
    while (cookieStr.charAt(0) === " ") cookieStr = cookieStr.substring(1);
    if (cookieStr.indexOf(nameEqual) === 0) return cookieStr.substring(nameEqual.length);
  }
  return null;
}

// ---------------------- Cookie Consent Banner -----------------------
function showCookieConsent() {
  // Check if cookie is already chosen
  if (getCookie("cookiesAccepted") !== null) return;

  // Ensure that banner won't stack up
  $("#cookie-consent-banner").remove();

  const $banner = $(`
    <div id="cookie-consent-banner">
      <div class="cookie">
        <h5>🍪 Cookie Consent</h5>
        <p>
          We use cookies to enhance your browsing experience.
          Your name and email will be remembered when you contribute.
          Do you want to accept cookies?
        </p>
        <div>
          <button id="acceptCookies" class="btn me-2">Accept</button>
          <button id="declineCookies" class="btn">Decline</button>
        </div>
      </div>
    </div>
  `);

  $("body").append($banner);

  // Accept Cookies
  $("#acceptCookies").on("click", function () {
    setCookie("cookiesAccepted", "true", 30);
    $("#cookie-consent-banner").fadeOut(300, function () {
      $(this).remove();
    });
  });

  // Decline Cookies
  $("#declineCookies").on("click", function () {
    setCookie("cookiesAccepted", "false", 30);
    $("#cookie-consent-banner").fadeOut(300, function () {
      $(this).remove();
    });
  });

  // Close banner if user clicks outside the cookie box
  $banner.on("click", function (e) {
    if (e.target.id === "cookie-consent-banner") {
      $(this).fadeOut(300, function () {
        $(this).remove();
      });
    }
  });
}

// Initialize the 
$(document).ready(function () {
  showCookieConsent();
});
