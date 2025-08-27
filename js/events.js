// Events Calendar functionality
$(document).ready(function() {
    let eventsData = [];
    let calendar;
    
    // Load events data
    $.getJSON('events.json')
        .done(function(data) {
            eventsData = data.events;
            initializeCalendar(eventsData);
            displayEvents(eventsData);
        })
        .fail(function() {
            console.error('Failed to load events data');
            showError('Failed to load events data. Please try again later.');
        });
    
    function initializeCalendar(events) {
        // Initialize FullCalendar
        const calendarEl = document.getElementById('calendar');
        
        // Format events for FullCalendar
        const calendarEvents = events.map(event => {
            return {
                id: event.id,
                title: event.title,
                start: event.date,
                end: event.endDate ? new Date(new Date(event.endDate).setDate(new Date(event.endDate).getDate() + 1)) : null,
                allDay: true,
                extendedProps: {
                    location: event.location,
                    category: event.category
                }
            };
        });
        
        // Initialize calendar
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                right: 'title'
            },

            events: calendarEvents,
            eventClick: function(info) {
                // Scroll to the event in the list
                const eventId = info.event.id;
                const eventElement = $(`#event-${eventId}`);
                
                if (eventElement.length) {
                    $('html, body').animate({
                        scrollTop: eventElement.offset().top - 100
                    }, 500);
                    
                    // Highlight the event temporarily
                    eventElement.addClass('highlight-event');
                    setTimeout(() => {
                        eventElement.removeClass('highlight-event');
                    }, 2000);
                }
            },
            eventDidMount: function(info) {
                const category = info.event.extendedProps.category;
                info.el.style.backgroundColor = getCategoryColor(category);
                info.el.style.borderColor = getCategoryColor(category);
            }
        });
        
        calendar.render();
    }
    
    function displayEvents(events) {
        const $eventsList = $('.events-list');
        $eventsList.empty();
        
        if (events.length === 0) {
            $eventsList.html(`
                <div class="no-events">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No events found</h3>
                    <p>There are no events scheduled at this time. Please check back later.</p>
                </div>
            `);
            return;
        }
        
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Create event cards
        events.forEach(ev => {
            // Check if user is interested in this event
            const isInterested = sessionStorage.getItem(`interested_${ev.id}`) === 'true';
            
            // Format date properly using 'date' field from JSON
            let eventDate = new Date(ev.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create date range if endDate exists
            if (ev.endDate && ev.date !== ev.endDate) {
                const endDate = new Date(ev.endDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                eventDate = `${eventDate} – ${endDate}`;
            }
            
            const eventCard = `
                <div class="event-card" id="event-${ev.id}">
                    <div class="event-image">
                        <img src="${ev.image}" alt="${ev.title}">
                    </div>
                    <div class="event-details">
                        <div class="event-date">
                            <i class="far fa-calendar-alt"></i>
                            ${eventDate}
                        </div>
                        <h3 class="event-title">${ev.title}</h3>
                        <div class="event-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${ev.location}
                        </div>
                        <p class="event-description">${ev.description}</p>
                        <div class="event-actions">
                            <span class="event-category">${formatCategory(ev.category)}</span>
                            <button class="interest-btn ${isInterested ? 'interested' : ''}" data-event="${ev.id}">
                                <i class="fas ${isInterested ? 'fa-check' : 'fa-star'}"></i>
                                ${isInterested ? 'Interested' : "I'm Interested!"}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            $eventsList.append(eventCard);
        });
        
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Interest button click
        $(document).on('click', '.interest-btn', function() {
            const eventId = $(this).data('event');
            const $button = $(this);
            const isCurrentlyInterested = $button.hasClass('interested');
            
            if (isCurrentlyInterested) {
                sessionStorage.removeItem(`interested_${eventId}`);
                $button.removeClass('interested');
                $button.html('<i class="fas fa-star"></i> I\'m Interested!');
                
                showNotification('Removed from your interests');
            } else {
                sessionStorage.setItem(`interested_${eventId}`, 'true');
                $button.addClass('interested');
                $button.html('<i class="fas fa-check"></i> Interested');
                
                showNotification('Added to your interests!');
            }
        });
    }
    
    function getCategoryColor(category) {
        const colors = {
            'festival': '#6f42c1',      
            'market': '#28a745',        
        };
        
        return colors[category] || '#6c757d';
    }
    
    function formatCategory(category) {
        const formatted = {
            'festival': 'Festival',        
            'market': 'Market',           
        };
        
        return formatted[category] || category;
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = $(`
            <div class="alert alert-success alert-dismissible fade show" role="alert" 
                 style="position: fixed; top: 100px; right: 20px; z-index: 1050; min-width: 300px;">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        
        $('body').append(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.alert('close');
        }, 3000);
    }
    
    function showError(message) {
        $('.events-list').html(`
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `);
    }
});