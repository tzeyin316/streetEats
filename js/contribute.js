// ---------------- Cookies ----------------
// Check if cookies are accepted
function cookiesAccepted() {
    return getCookie("cookiesAccepted") === "true";
}

// ---------------- Load Saved Data ----------------
function loadSavedData() {
    // Load name and email (only if cookies are accepted)
    if (cookiesAccepted()) {
        const savedName = getCookie('contributorName');
        const savedEmail = getCookie('contributorEmail');

        if (savedName) {
            $('#storyName, #photoName, #recipeName').val(savedName);
        }
        if (savedEmail) {
            $('#storyEmail, #photoEmail, #recipeEmail').val(savedEmail);
        }
    }

    // Load draft from session storage (not affected by cookies consent)
    const draftData = [
        'storyName', 'storyEmail', 'storyTitle', 'storyContent',
        'photoName', 'photoEmail', 'photoDescription',
        'recipeName', 'recipeEmail', 'recipeTitle', 'recipeIngredients', 'recipeInstructions'
    ];

    draftData.forEach(field => {
        const value = sessionStorage.getItem(field);
        if (value) 
            $(`#${field}`).val(value);
    });
}

// ---------------- Auto Save ------------------
function setupAutoSave() {
    // Save name/email to cookies (only if cookies are accepted)
    if (cookiesAccepted()) {
        $('input[id$="Name"]').on('input', function () {
            const name = $(this).val().trim();
            if (name) setCookie('contributorName', name, 30);
        });

        $('input[id$="Email"]').on('input', function () {
            const email = $(this).val().trim();
            if (email) setCookie('contributorEmail', email, 30);
        });
    }

    // Save form draft to session storage (not affected by cookies consent)
    $('input, textarea').on('input', function () {
        const id = $(this).attr('id');
        if (id) sessionStorage.setItem(id, $(this).val());
    });
}

//----------------- Form validation helper -----------------
function isValidEmail(email) {
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailFormat.test(email);
}

// Story validation
function validateStoryForm() {
    let isValid = true;
    $('.error-message').text('');

    const name = $('#storyName').val().trim();
    const email = $('#storyEmail').val().trim();
    const title = $('#storyTitle').val().trim();
    const content = $('#storyContent').val().trim();

    if (!name) { $('#storyNameError').text('Name is required'); isValid = false; }
    if (!email) { $('#storyEmailError').text('Email is required'); isValid = false; }
    else if (!isValidEmail(email)) { $('#storyEmailError').text('Enter a valid email'); isValid = false; }
    if (!title) { $('#storyTitleError').text('Story title is required'); isValid = false; }
    if (!content) { $('#storyContentError').text('Story content is required'); isValid = false; }

    return isValid;
}

// Photo validation
function validatePhotoForm() {
    let isValid = true;
    $('.error-message').text('');

    const name = $('#photoName').val().trim();
    const email = $('#photoEmail').val().trim();
    const files = $('#photoUpload')[0].files;
    const description = $('#photoDescription').val().trim();

    if (!name) { $('#photoNameError').text('Name is required'); isValid = false; }
    if (!email) { $('#photoEmailError').text('Email is required'); isValid = false; }
    else if (!isValidEmail(email)) { $('#photoEmailError').text('Enter a valid email'); isValid = false; }
    if (files.length === 0) { $('#photoUploadError').text('Select at least one photo'); isValid = false; }
    else {
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith('image/')) {
                $('#photoUploadError').text('Only image files allowed'); isValid = false; break;
            }
        }
    }
    if (!description) { $('#photoDescriptionError').text('Photo description is required'); isValid = false; }

    return isValid;
}

// Recipe validation
function validateRecipeForm() {
    let isValid = true;
    $('.error-message').text('');

    const name = $('#recipeName').val().trim();
    const email = $('#recipeEmail').val().trim();
    const title = $('#recipeTitle').val().trim();
    const ingredients = $('#recipeIngredients').val().trim();
    const instructions = $('#recipeInstructions').val().trim();

    if (!name) { $('#recipeNameError').text('Name is required'); isValid = false; }
    if (!email) { $('#recipeEmailError').text('Email is required'); isValid = false; }
    else if (!isValidEmail(email)) { $('#recipeEmailError').text('Enter a valid email'); isValid = false; }
    if (!title) { $('#recipeTitleError').text('Recipe title is required'); isValid = false; }
    if (!ingredients) { $('#recipeIngredientsError').text('Ingredients are required'); isValid = false; }
    if (!instructions) { $('#recipeInstructionsError').text('Instructions are required'); isValid = false; }

    return isValid;
}

// ---------------- Clear cookies (if not accepted) ----------------
function clearCookiesIfNotAccepted() {
    if (!cookiesAccepted()) {
        setCookie('contributorName', '', -1);
        setCookie('contributorEmail', '', -1);
    }
}

// ---------------- Clear draft in session storage (after submission) ----------------
function clearDraft(formType) {
    const draftData = {
        story: ['storyName', 'storyEmail', 'storyTitle', 'storyContent'],
        photo: ['photoName', 'photoEmail', 'photoUpload', 'photoDescription'],
        recipe: ['recipeName', 'recipeEmail', 'recipeTitle', 'recipeIngredients', 'recipeInstructions']
    };

    draftData[formType].forEach(field => sessionStorage.removeItem(field));
}

//-------------- Form validation -----------------
$(document).ready(function () {
    // Load the correct tab (from index page or hash)
    const hash = window.location.hash;
    let tabId;

    if (hash) {
        tabId = hash.substring(1);
    } else {
        tabId = "story";
    }

    const tabButton = $(`#${tabId}-tab`);
    if (tabButton.length) {
        // Clear any pre-set actives
        $('#contributeTabs button').removeClass('active').attr('aria-selected', 'false');
        $('.tab-pane').removeClass('show active');

        // Show the right tab
        const tab = new bootstrap.Tab(tabButton[0]);
        tab.show();
    }
    
    loadSavedData();
    setupAutoSave();
    clearCookiesIfNotAccepted();

    // Form submissions
    $('#story-form form').on('submit', function (e) {
        e.preventDefault();
        if (validateStoryForm()) {
            $(this).html('<div class="alert alert-success"><i class="fas fa-check-circle"></i> Thanks! Your story has been submitted.</div>');
            clearDraft('story');
        }
    });

    $('#photo-form form').on('submit', function (e) {
        e.preventDefault();
        if (validatePhotoForm()) {
            $(this).html('<div class="alert alert-success"><i class="fas fa-check-circle"></i> Thanks! Your photos have been submitted.</div>');
            clearDraft('photo');
        }
    });

    $('#recipe-form form').on('submit', function (e) {
        e.preventDefault();
        if (validateRecipeForm()) {
            $(this).html('<div class="alert alert-success"><i class="fas fa-check-circle"></i> Thanks! Your recipe has been submitted.</div>');
            clearDraft('recipe');
        }
    });
});

