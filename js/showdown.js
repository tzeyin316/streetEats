// Global Food Showdown functionality
$(document).ready(function() {
    let currentComparisonId = '';
    let comparisonsData = [];
    
    // Load comparison data
    $.getJSON('showdown.json')
        .done(function(data) {
            comparisonsData = data.comparisons;
            initializeShowdown(comparisonsData);
        })
        .fail(function() {
            console.error('Failed to load food comparisons data');
            showError('Failed to load comparison data. Please try again later.');
        });
    
    function initializeShowdown(comparisons) {
        // Create navigation pills
        const $navPills = $('.comparison-nav .nav-pills');
        $navPills.empty();
        
        comparisons.forEach((comparison, index) => {
            const isActive = index === 0 ? 'active' : '';
            const pill = `
                <li class="nav-item">
                    <a class="nav-link ${isActive}" href="#" data-comparison="${comparison.id}">${comparison.title}</a>
                </li>
            `;
            $navPills.append(pill);
            
            // Create comparison card
            const isCardActive = index === 0 ? 'active' : '';
            const card = createComparisonCard(comparison, isCardActive);
            $('.comparison-content').append(card);
        });
        
        // Set first comparison as active
        if (comparisons.length > 0) {
            currentComparisonId = comparisons[0].id;
            updateVotingSection(comparisons[0]);
            createRadarChart(comparisons[0]);
        }
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Create flip cards with food stories on the back
    function createComparisonCard(comparison, isActive) {
        return `
            <div class="comparison-card ${isActive}" id="${comparison.id}">
                <div class="food-comparison">
                    <div class="food-card-flip">
                        <div class="food-card-inner">
                            <!-- Front of card -->
                            <div class="food-card-front">
                                <div class="food-image">
                                    <img src="${comparison.food1.image}" alt="${comparison.food1.name}">
                                </div>
                                <div class="food-details">
                                    <h3>${comparison.food1.name}</h3>
                                    <p>${comparison.food1.description}</p>
                                    <div class="flip-hint">
                                        <i class="fas fa-sync-alt"></i> Click to flip for story
                                    </div>
                                </div>
                            </div>
                            <!-- Back of card with story -->
                            <div class="food-card-back">
                                <div class="food-story">
                                    <h3>${comparison.food1.name} Story</h3>
                                    <div class="story-content">
                                        ${getFoodStory(comparison.food1.name)}
                                    </div>
                                    <div class="flip-back-hint">
                                        <i class="fas fa-sync-alt"></i> Click to flip back
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="food-card-flip">
                        <div class="food-card-inner">
                            <!-- Front of card -->
                            <div class="food-card-front">
                                <div class="food-image">
                                    <img src="${comparison.food2.image}" alt="${comparison.food2.name}">
                                </div>
                                <div class="food-details">
                                    <h3>${comparison.food2.name}</h3>
                                    <p>${comparison.food2.description}</p>
                                    <div class="flip-hint">
                                        <i class="fas fa-sync-alt"></i> Click to flip for story
                                    </div>
                                </div>
                            </div>
                            <!-- Back of card with story -->
                            <div class="food-card-back">
                                <div class="food-story">
                                    <h3>${comparison.food2.name} Story</h3>
                                    <div class="story-content">
                                        ${getFoodStory(comparison.food2.name)}
                                    </div>
                                    <div class="flip-back-hint">
                                        <i class="fas fa-sync-alt"></i> Click to flip back
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Flavor Profile Comparison</h3>
                    <canvas id="chart-${comparison.id}" height="300"></canvas>
                </div>
            </div>
        `;
    }
    
    // NEW: Food stories for each dish
    function getFoodStory(foodName) {
        const stories = {
            'Nasi Lemak': `
                <p><strong>The Heart of Malaysia</strong></p>
                <p>Born in the early 1900s, Nasi Lemak started as a humble farmer's breakfast in rural Malaysia. The fragrant coconut rice would be wrapped in banana leaves, making it the perfect portable meal for workers heading to the paddy fields at dawn.</p>
                <p>The sambal is the soul - each family guards their recipe jealously. Some say the best sambal comes from grinding chilies on a stone mortar at 4 AM, when the morning dew keeps the spices cool.</p>
                <p>Today, this "national dish" brings Malaysians together at mamak stalls, hawker centers, and high-end restaurants alike.</p>
            `,
            'Nasi Uduk': `
                <p><strong>Jakarta's Morning Embrace</strong></p>
                <p>Nasi Uduk emerged from the Betawi community of Jakarta, traditionally served as a hearty morning meal. The coconut rice is steamed with pandan leaves, giving it a subtle sweetness and aromatic fragrance.</p>
                <p>Street vendors would carry it in large wooden containers, cycling through neighborhoods as the city awakened. The array of side dishes - from crispy tempeh to spicy sambal kacang - reflects Indonesia's incredible culinary diversity.</p>
                <p>More than just food, it's a symbol of Indonesian community spirit, often shared during celebrations and gatherings.</p>
            `,
            'Char Kway Teow': `
                <p><strong>Wok Hei Mastery</strong></p>
                <p>Born in the fishing villages of Penang and southern China, Char Kway Teow was originally a cheap meal for dock workers. The "wok hei" - breath of the wok - is everything. It's that smoky, slightly charred flavor that can only come from cooking over intense heat.</p>
                <p>The secret lies in the dark soy sauce and the courage to let the noodles char slightly. Traditional recipes use lard and cockles, ingredients that sparked fierce debates about authenticity as the dish evolved.</p>
                <p>A true master can tell the doneness just by the sound of the wok and the aroma filling the air.</p>
            `,
            'Pad Thai': `
                <p><strong>National Identity on a Plate</strong></p>
                <p>Pad Thai was actually created in the 1930s as part of a nationalist campaign by Prime Minister Plaek Phibunsongkhram to promote Thai identity. The government distributed recipes to encourage a unified "Thai" dish.</p>
                <p>The balance is crucial - sweet from palm sugar, sour from tamarind, salty from fish sauce, and spicy from chilies. Street vendors often adjust the flavors on the spot, asking customers "pet maak mai?" (very spicy?).</p>
                <p>The humble rice noodle dish became Thailand's most famous culinary export, found in Thai restaurants worldwide.</p>
            `,
            'Satay': `
                <p><strong>Smoky Nights and Peanut Dreams</strong></p>
                <p>Satay traces its roots to Javanese cuisine, brought to Malaysia by Indonesian immigrants. The magic happens over glowing charcoal, where bamboo skewers of marinated meat dance over the flames.</p>
                <p>The peanut sauce is an art form - some prefer it thick and sweet, others thin and spicy. Traditional recipes include galangal, lemongrass, and turmeric in the marinade, creating layers of flavor that penetrate deep into the meat.</p>
                <p>Night markets come alive with the smoky aroma, as vendors fan their grills and customers gather around the warm glow, sharing stories over perfectly charred skewers.</p>
            `,
            'Yakitori': `
                <p><strong>The Art of Simplicity</strong></p>
                <p>Yakitori emerged during Japan's Meiji era when Buddhism restrictions on eating meat were lifted. What started as simple grilled chicken in Tokyo's working-class districts evolved into a refined culinary art.</p>
                <p>The tare sauce - a closely guarded blend of soy sauce, mirin, and sake - is often passed down through generations. Some tare bases are decades old, creating depth that can't be replicated.</p>
                <p>In traditional yakitori-ya, the chef grills over white-hot binchotan charcoal, achieving the perfect balance of crispy skin and tender meat. Each part of the chicken has its purpose and preparation method.</p>
            `
        };
        
        return stories[foodName] || `<p>A beloved dish with rich cultural heritage and unique flavors that tell the story of its people.</p>`;
    }
    
    function setupEventListeners() {
        // Navigation pills click with smooth scrolling
        $(document).on('click', '.comparison-nav .nav-link', function(e) {
            e.preventDefault();
            
            const comparisonId = $(this).data('comparison');
            if (comparisonId === currentComparisonId) return;
            
            // Update active nav link
            $('.comparison-nav .nav-link').removeClass('active');
            $(this).addClass('active');
            
            // Hide current comparison card
            $(`.comparison-card`).removeClass('active');
            
            // Show new comparison card
            $(`#${comparisonId}`).addClass('active');
            currentComparisonId = comparisonId;
            
            // Smooth scroll to comparison content
            $('html, body').animate({
                scrollTop: $('.comparison-content').offset().top - 100
            }, 500);
            
            // Update voting section and chart
            const comparison = comparisonsData.find(c => c.id === comparisonId);
            if (comparison) {
                updateVotingSection(comparison);
                // Delay chart creation to ensure smooth transition
                setTimeout(() => {
                    createRadarChart(comparison);
                }, 300);
            }
        });
        
        // Card flip functionality
        $(document).on('click', '.food-card-flip', function(e) {
            e.preventDefault();
            $(this).toggleClass('flipped');
        });
        
        // Vote buttons click
        $(document).on('click', '.vote-btn', function() {
            const foodChoice = $(this).data('food');
            const comparison = comparisonsData.find(c => c.id === currentComparisonId);
            
            if (!comparison) return;
            
            // Check if user already voted
            const hasVoted = sessionStorage.getItem(`voted_${currentComparisonId}`);
            if (hasVoted) {
                alert('You have already voted in this comparison!');
                return;
            }
            
            // Update vote count
            comparison.votes[foodChoice] += 1;
            
            // Save vote to sessionStorage
            sessionStorage.setItem(`voted_${currentComparisonId}`, foodChoice);
            
            // Update UI
            updateVoteResults(comparison);
            
            // Disable buttons
            $('.vote-btn').addClass('voted').prop('disabled', true);
            
            // Show thank you message
            $('.vote-thanks').fadeIn();
        });
        
        // Social sharing
        $(document).on('click', '.social-btn', function(e) {
            e.preventDefault();
            
            const platform = $(this).data('platform');
            const comparison = comparisonsData.find(c => c.id === currentComparisonId);
            
            if (!comparison) return;
            
            let shareUrl = '';
            const text = `Check out this food comparison: ${comparison.title} on Street Eats!`;
            const url = encodeURIComponent(window.location.href);
            
            if (platform === 'twitter') {
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
            } else if (platform === 'facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            }
            
            window.open(shareUrl, '_blank');
        });
    }
    
    // Radar chart
    function createRadarChart(comparison) {
        const canvas = $(`#chart-${comparison.id}`);
        if (!canvas.length) return;
        
        // Destroy existing chart if it exists
        if (window.radarChart) {
            window.radarChart.destroy();
        }
        
        const ctx = canvas[0].getContext('2d');
        
        const data = {
            labels: ['Sweetness', 'Saltiness', 'Spiciness', 'Umami', 'Aroma'],
            datasets: [
                {
                    label: comparison.food1.name,
                    data: [
                        comparison.food1.flavorProfile.sweetness,
                        comparison.food1.flavorProfile.saltiness,
                        comparison.food1.flavorProfile.spiciness,
                        comparison.food1.flavorProfile.umami,
                        comparison.food1.flavorProfile.aroma
                    ],
                    backgroundColor: 'rgba(212, 119, 60, 0.2)',
                    borderColor: 'rgba(212, 119, 60, 1)',
                    pointBackgroundColor: 'rgba(212, 119, 60, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(212, 119, 60, 1)'
                },
                {
                    label: comparison.food2.name,
                    data: [
                        comparison.food2.flavorProfile.sweetness,
                        comparison.food2.flavorProfile.saltiness,
                        comparison.food2.flavorProfile.spiciness,
                        comparison.food2.flavorProfile.umami,
                        comparison.food2.flavorProfile.aroma
                    ],
                    backgroundColor: 'rgba(108, 117, 125, 0.2)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    pointBackgroundColor: 'rgba(108, 117, 125, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(108, 117, 125, 1)'
                }
            ]
        };
        
        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#333',
                            padding: 20
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 3
                    },
                    point: {
                        radius: 6
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true,
                            color: '#e9ecef',
                            lineWidth: 2
                        },
                        grid: {
                            color: '#dee2e6',
                            lineWidth: 1
                        },
                        pointLabels: {
                            font: {
                                size: 14
                            },
                            color: '#333'
                        },
                        ticks: {
                            font: {
                                size: 14
                            },
                            color: '#666',
                            stepSize: 2,
                            showLabelBackdrop: true,
                            backdropColor: 'rgba(255, 255, 255, 0.8)'
                        },
                        suggestedMin: 0,
                        suggestedMax: 10
                    }
                }
            }
        };
        
        window.radarChart = new Chart(ctx, config);
    }
    
    function updateVotingSection(comparison) {
        // Update button text with food names
        $('.food1-name').text(comparison.food1.name);
        $('.food2-name').text(comparison.food2.name);
        
        // Check if user already voted
        const hasVoted = sessionStorage.getItem(`voted_${comparison.id}`);
        
        if (hasVoted) {
            $('.vote-btn').addClass('voted').prop('disabled', true);
            $('.vote-thanks').show();
        } else {
            $('.vote-btn').removeClass('voted').prop('disabled', false);
            $('.vote-thanks').hide();
        }
        
        // Update vote results
        updateVoteResults(comparison);
    }
    
    function updateVoteResults(comparison) {
        const totalVotes = comparison.votes.food1 + comparison.votes.food2;
        const food1Percentage = totalVotes > 0 ? Math.round((comparison.votes.food1 / totalVotes) * 100) : 0;
        const food2Percentage = totalVotes > 0 ? Math.round((comparison.votes.food2 / totalVotes) * 100) : 0;
        
        // Update progress bars
        $('.vote-progress-food1').css('width', `${food1Percentage}%`);
        $('.vote-progress-food2').css('width', `${food2Percentage}%`);
        
        // Update percentages
        $(`.vote-percentage-food1`).text(`${food1Percentage}%`);
        $(`.vote-percentage-food2`).text(`${food2Percentage}%`);
    }
    
    function showError(message) {
        $('.comparison-content').html(`
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `);
    }
});