$(document).ready(function() {
    const $form = $('.contact-form');
    const $submitBtn = $form.find('.submit-btn');

    // Character counter
    const $textarea = $form.find('#message');
    const $counter = $('<div class="character-counter" style="text-align:right;font-size:0.8rem;color:#666;margin-top:5px;"></div>');
    $textarea.after($counter);

    $textarea.on('input', function() {
        const len = $(this).val().length;
        $counter.text(len + ' characters');
        $counter.css('color', len > 500 ? '#d4773c' : '#666');
    });

    // Form submission
    $form.on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.checkValidity() === false) {
            $(this).addClass('was-validated');
            return;
        }

        $submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Sending...').prop('disabled', true);

        const formData = {};
        $(this).serializeArray().forEach(item => formData[item.name] = item.value);
        console.log('Form data:', formData);

        // Simulate sending
        setTimeout(function() {
            $form.hide();
            const $successDiv = $('<div class="alert alert-success">Message sent! Thank you for contacting us.</div>');
            $form.parent().append($successDiv);
            $successDiv[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1500);
    });

    // Fade-in animation for cards
    const $cards = $('.contact-method-card');
    $cards.css({opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease'});

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).css({opacity: 1, transform: 'translateY(0)'});
            }
        });
    }, { threshold: 0.1 });

    $cards.each(function() {
        observer.observe(this);
    });
});
