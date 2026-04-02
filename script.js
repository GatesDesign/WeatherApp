

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }


        let deferredPrompt;
        const installButton = document.getElementById('installPWA');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installButton.style.display = 'flex';

            installButton.addEventListener('click', () => {
                installButton.style.display = 'none';
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted install');
                    }
                    deferredPrompt = null;
                });
            });
        });


        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        function updateOnlineStatus() {
            const offlineIndicator = document.getElementById('offline-indicator');
            if (!navigator.onLine) {
                offlineIndicator.style.display = 'block';
                loadCachedWeatherData();
            } else {
                offlineIndicator.style.display = 'none';
            }
        }

        function loadCachedWeatherData() {
            const cachedData = localStorage.getItem('cachedWeatherData');
            if (cachedData) {
                const data = JSON.parse(cachedData);
                updateCurrentWeather(data);
                showNotification('Showing cached weather data (offline mode)', 'info');
            }
        }


        const translations = {
            en: {
                search: 'Search',
                temperature: 'Temperature',
                feelsLike: 'Feels Like',
                humidity: 'Humidity',
                wind: 'Wind Speed',
                pressure: 'Pressure',
                sunrise: 'Sunrise',
                sunset: 'Sunset',
                moonPhase: 'Moon Phase',
                dayLength: 'Day Length',
                airQuality: 'Air Quality',
                good: 'Good',
                moderate: 'Moderate',
                unhealthy: 'Unhealthy',
                weatherAlerts: 'Weather Alerts',
                noAlerts: 'No Active Alerts',
                whatToWear: 'What to Wear',
                recentSearches: 'Recent Searches'
            },
            es: {
                search: 'Buscar',
                temperature: 'Temperatura',
                feelsLike: 'Sensación Térmica',
                humidity: 'Humedad',
                wind: 'Velocidad del Viento',
                pressure: 'Presión',
                sunrise: 'Amanecer',
                sunset: 'Atardecer',
                moonPhase: 'Fase Lunar',
                dayLength: 'Duración del Día',
                airQuality: 'Calidad del Aire',
                good: 'Buena',
                moderate: 'Moderada',
                unhealthy: 'Mala',
                weatherAlerts: 'Alertas Meteorológicas',
                noAlerts: 'Sin Alertas Activas',
                whatToWear: 'Qué Ponerse',
                recentSearches: 'Búsquedas Recientes'
            },
            fr: {
                search: 'Rechercher',
                temperature: 'Température',
                feelsLike: 'Ressenti',
                humidity: 'Humidité',
                wind: 'Vitesse du Vent',
                pressure: 'Pression',
                sunrise: 'Lever du Soleil',
                sunset: 'Coucher du Soleil',
                moonPhase: 'Phase de la Lune',
                dayLength: 'Durée du Jour',
                airQuality: 'Qualité de l'Air',
                good: 'Bonne',
                moderate: 'Modérée',
                unhealthy: 'Mauvaise',
                weatherAlerts: 'Alertes Météo',
                noAlerts: 'Aucune Alerte Active',
                whatToWear: 'Quoi Porter',
                recentSearches: 'Recherches Récentes'
            },
            de: {
                search: 'Suchen',
                temperature: 'Temperatur',
                feelsLike: 'Gefühlt',
                humidity: 'Luftfeuchtigkeit',
                wind: 'Windgeschwindigkeit',
                light: "luftdruck",
                shadow: "border-white",
                error_message: "felher-home-negative-alert",
                message_icon: "fa-exclamation-triangle",
                pressure: 'Luftdruck',
                sunrise: 'Sonnenaufgang',
                sunset: 'Sonnenuntergang',
                moonPhase: 'Mondphase',
                dayLength: 'Tageslänge',
                airQuality: 'Luftqualität',
                good: 'Gut',
                moderate: 'Mäßig',
                unhealthy: 'Ungesund',
                weatherAlerts: 'Wetterwarnungen',
                noAlerts: 'Keine aktiven Warnungen',
                whatToWear: 'Was anziehen',
                recentSearches: 'Letzte Suchen'
            }
        };

        let currentLang = localStorage.getItem('language') || 'en';

        function setLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('language', lang);
            updateAllText();


            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        function updateAllText() {

            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (translations[currentLang][key]) {
                    element.textContent = translations[currentLang][key];
                }
            });
        }


        function showFeature(feature) {

            document.querySelectorAll('.feature-section').forEach(section => {
                section.classList.remove('active');
            });


            document.querySelectorAll('.feature-btn').forEach(btn => {
                btn.classList.remove('active');
            });


            document.getElementById(`${feature}-section`).classList.add('active');


            event.target.classList.add('active');
        }


        function generateAIInsights(weatherData) {
            const container = document.getElementById('ai-insights-content');
            container.innerHTML = '';

            const insights = [
                {
                    icon: 'fa-thermometer-half',
                    title: 'Temperature Prediction',
                    insight: getTemperatureInsight(weatherData),
                    confidence: 85
                },
                {
                    icon: 'fa-cloud-rain',
                    title: 'Rain Forecast',
                    insight: getRainInsight(weatherData),
                    confidence: 78
                },
                {
                    icon: 'fa-wind',
                    title: 'Wind Analysis',
                    insight: getWindInsight(weatherData),
                    confidence: 92
                },
                {
                    icon: 'fa-sun',
                    title: 'UV Risk Assessment',
                    insight: getUVInsightText(weatherData),
                    confidence: 88
                }
            ];

            insights.forEach(insight => {
                const insightHTML = `
                    <div class="insight-card">
                        <h4><i class="fas ${insight.icon}"></i> ${insight.title}</h4>
                        <p>${insight.insight}</p>
                        <div class="confidence-meter">
                            <div class="confidence-fill" style="width: ${insight.confidence}%"></div>
                        </div>
                        <small>Confidence: ${insight.confidence}%</small>
                    </div>
                `;
                container.innerHTML += insightHTML;
            });
        }

        function getTemperatureInsight(data) {
            const temps = data.daily.temperature_2m_max;
            const currentTemp = data.current.temperature_2m;
            const avgTemp = temps.reduce((a, b) => a + b) / temps.length;

            if (currentTemp > avgTemp + 3) {
                return "Temperature is significantly above average. Expect continued warm conditions.";
            } else if (currentTemp < avgTemp - 3) {
                return "Temperature is below average. Cooling trend expected to continue.";
            } else {
                return "Temperature stable near seasonal averages.";
            }
        }

        function getRainInsight(data) {
            const prob = data.daily.precipitation_probability_max[0] || 0;

            if (prob > 70) {
                return "High probability of precipitation. Carry an umbrella.";
            } else if (prob > 40) {
                return "Moderate chance of rain. Stay prepared.";
            } else {
                return "Low precipitation risk. Dry conditions expected.";
            }
        }

        function getWindInsight(data) {
            const windSpeed = data.current.wind_speed_10m;

            if (windSpeed > 30) {
                return "Strong winds expected. Secure loose objects outdoors.";
            } else if (windSpeed > 20) {
                return "Breezy conditions. Good for wind-based activities.";
            } else {
                return "Light winds. Calm conditions prevailing.";
            }
        }

        function getUVInsightText(data) {
            const uvIndex = data.daily.uv_index_max[0] || 5;

            if (uvIndex > 8) {
                return "Extreme UV levels. Maximum protection required.";
            } else if (uvIndex > 6) {
                return "High UV radiation. Sunscreen recommended.";
            } else {
                return "Moderate UV levels. Standard protection sufficient.";
            }
        }


        let comparedCities = JSON.parse(localStorage.getItem('comparedCities')) || [];

        function addCityToCompare() {
            const input = document.getElementById('compare-city-input');
            const city = input.value.trim();

            if (city && !comparedCities.includes(city)) {
                comparedCities.push(city);
                localStorage.setItem('comparedCities', JSON.stringify(comparedCities));
                updateComparisonGrid();
                input.value = '';
            }
        }

        function removeCityFromCompare(city) {
            comparedCities = comparedCities.filter(c => c !== city);
            localStorage.setItem('comparedCities', JSON.stringify(comparedCities));
            updateComparisonGrid();
        }

        function updateComparisonGrid() {
            const grid = document.getElementById('comparison-grid');
            grid.innerHTML = '';

            comparedCities.forEach(city => {
                const cardHTML = `
                    <div class="comparison-card">
                        <h4>${city}</h4>
                        <div class="weather-icon">
                            <i class="fas fa-cloud-sun"></i>
                        </div>
                        <div class="temp">24°C</div>
                        <div class="condition">Partly Cloudy</div>
                        <button class="remove-city" onclick="removeCityFromCompare('${city}')">
                            Remove
                        </button>
                    </div>
                `;
                grid.innerHTML += cardHTML;
            });
        }


        function generateHealthTips(weatherData) {
            const container = document.getElementById('health-tips');
            container.innerHTML = '';

            const current = weatherData.current;
            const temp = current.temperature_2m;
            const humidity = current.relative_humidity_2m;
            const uvIndex = weatherData.daily.uv_index_max[0] || 5;
            const windSpeed = current.wind_speed_10m;

            const tips = [];


            if (uvIndex > 6) {
                tips.push({
                    icon: 'fa-sun',
                    tip: 'High UV index detected. Apply SPF 30+ sunscreen every 2 hours.'
                });
            }


            if (humidity > 70) {
                tips.push({
                    icon: 'fa-tint',
                    tip: 'High humidity may affect breathing. Stay hydrated and avoid strenuous activities.'
                });
            } else if (humidity < 30) {
                tips.push({
                    icon: 'fa-wind',
                    tip: 'Low humidity can cause dry skin. Use moisturizer and drink plenty of water.'
                });
            }


            if (temp > 30) {
                tips.push({
                    icon: 'fa-thermometer-full',
                    tip: 'High temperature alert. Stay in cool areas and drink extra fluids.'
                });
            } else if (temp < 10) {
                tips.push({
                    icon: 'fa-thermometer-empty',
                    tip: 'Cold weather warning. Dress in layers to maintain body heat.'
                });
            }


            if (windSpeed > 25) {
                tips.push({
                    icon: 'fa-wind',
                    tip: 'Strong winds may cause eye irritation. Consider wearing protective eyewear.'
                });
            }


            tips.forEach(tip => {
                const tipHTML = `
                    <div class="health-tip">
                        <i class="fas ${tip.icon}"></i>
                        <div>
                            <p>${tip.tip}</p>
                        </div>
                    </div>
                `;
                container.innerHTML += tipHTML;
            });


            generateActivityPlanner(weatherData);
        }

        function generateActivityPlanner(weatherData) {
            const container = document.getElementById('activity-planner');
            const current = weatherData.current;
            const temp = current.temperature_2m;
            const code = current.weather_code;
            const condition = getWeatherDescription(code).toLowerCase();
            const windSpeed = current.wind_speed_10m;

            container.innerHTML = '';

            const activities = [];

            if (temp > 20 && !condition.includes('rain')) {
                activities.push({
                    icon: 'fa-biking',
                    name: 'Cycling',
                    suitability: 'Excellent',
                    reason: 'Perfect temperature and dry conditions'
                });
            }

            if (temp > 15 && temp < 25 && windSpeed < 20) {
                activities.push({
                    icon: 'fa-hiking',
                    name: 'Hiking',
                    suitability: 'Good',
                    reason: 'Mild temperature and light winds'
                });
            }

            if (condition.includes('rain')) {
                activities.push({
                    icon: 'fa-film',
                    name: 'Indoor Movies',
                    suitability: 'Recommended',
                    reason: 'Rainy weather - perfect for indoor entertainment'
                });
            }

            if (temp < 10) {
                activities.push({
                    icon: 'fa-hot-tub',
                    name: 'Hot Beverages',
                    suitability: 'Perfect',
                    reason: 'Cold weather calls for warm drinks'
                });
            }

            activities.forEach(activity => {
                const activityHTML = `
                    <div class="activity ${activity.suitability.toLowerCase()}">
                        <i class="fas ${activity.icon}"></i>
                        <div>
                            <strong>${activity.name}</strong>
                            <span class="suitability">${activity.suitability}</span>
                            <p>${activity.reason}</p>
                        </div>
                    </div>
                `;
                container.innerHTML += activityHTML;
            });
        }


        const achievements = [
            { id: 'sun_seeker', title: 'Sun Seeker', description: 'Check weather for 7 sunny days', icon: 'fa-sun', unlocked: true },
            { id: 'rain_warrior', title: 'Rain Warrior', description: 'Experience 5 rainstorms', icon: 'fa-umbrella', unlocked: false },
            { id: 'wind_rider', title: 'Wind Rider', description: 'Check weather on 3 windy days', icon: 'fa-wind', unlocked: true },
            { id: 'temperature_master', title: 'Temperature Master', description: 'Track temperature for 30 days', icon: 'fa-thermometer-full', unlocked: false },
            { id: 'storm_chaser', title: 'Storm Chaser', description: 'Witness 2 thunderstorms', icon: 'fa-bolt', unlocked: false },
            { id: 'weather_expert', title: 'Weather Expert', description: 'Use all features of the app', icon: 'fa-graduation-cap', unlocked: false }
        ];

        function loadAchievements() {
            const grid = document.getElementById('achievements-grid');
            grid.innerHTML = '';

            achievements.forEach(achievement => {
                const achievementHTML = `
                    <div class="achievement ${achievement.unlocked ? 'unlocked' : ''}">
                        <i class="fas ${achievement.icon}"></i>
                        <h4>${achievement.title}</h4>
                        <p>${achievement.description}</p>
                    </div>
                `;
                grid.innerHTML += achievementHTML;
            });
        }

        function loadWeatherQuiz() {
            const container = document.getElementById('weather-quiz');
            const quiz = {
                question: "What does cumulonimbus clouds indicate?",
                options: ["Thunderstorms", "Clear Sky", "Light Rain", "Fog"],
                correct: 0
            };

            container.innerHTML = `
                <h4>Daily Weather Quiz</h4>
                <p>${quiz.question}</p>
                <div class="quiz-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    ${quiz.options.map((option, index) => `
                        <button onclick="checkQuizAnswer(${index}, ${quiz.correct})" 
                                class="export-btn" 
                                style="text-align: left;">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        function checkQuizAnswer(selected, correct) {
            const buttons = document.querySelectorAll('.quiz-options button');
            buttons.forEach(button => button.disabled = true);

            if (selected === correct) {
                event.target.style.background = 'var(--success)';
                event.target.style.color = 'white';
                showNotification('Correct! Cumulonimbus clouds indicate thunderstorms.', 'success');
            } else {
                event.target.style.background = 'var(--danger)';
                event.target.style.color = 'white';
                buttons[correct].style.background = 'var(--success)';
                buttons[correct].style.color = 'white';
                showNotification('Incorrect. Cumulonimbus clouds indicate thunderstorms.', 'error');
            }
        }


        function updateWidgetCode(city) {
            const widgetCode = `<iframe src="https://weathercastpro.com/widget?city=${encodeURIComponent(city)}&theme=light" width="300" height="400" frameborder="0" style="border-radius: 10px;"></iframe>`;
            document.getElementById('widget-code').value = widgetCode;
            showNotification(`Widget code updated for ${city}`, 'info');
        }

        function copyWidgetCode() {
            const codeTextarea = document.getElementById('widget-code');
            codeTextarea.select();
            document.execCommand('copy');

            const originalText = event.target.innerHTML;
            event.target.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                event.target.innerHTML = originalText;
            }, 2000);

            showNotification('Widget code copied to clipboard', 'success');
        }


        function shareMyWeather() {
            const city = document.getElementById('city-name').textContent;
            const temp = document.getElementById('current-temp').textContent;
            const unit = document.getElementById('temp-unit').textContent;
            const description = document.getElementById('weather-description').textContent;

            const text = `Current weather in ${city}: ${temp}°${unit} and ${description}. Check it out on WeatherCast Pro!`;

            if (navigator.share) {
                navigator.share({
                    title: `Weather in ${city}`,
                    text: text,
                    url: window.location.href
                });
            } else {

                navigator.clipboard.writeText(text).then(() => {
                    showNotification('Weather info copied to clipboard!', 'success');
                });
            }
        }


        function generateApiKey() {
            const apiKey = 'wcp_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
            showNotification(`API Key Generated: ${apiKey}`, 'success');


            localStorage.setItem('apiKey', apiKey);
        }


        let arStream = null;

        async function startAR() {
            try {
                const video = document.getElementById('ar-video');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                video.srcObject = stream;
                arStream = stream;

                showNotification('AR mode activated. Point camera at sky.', 'info');
            } catch (error) {
                console.error('AR error:', error);
                showError('Unable to access camera for AR mode.');
            }
        }


        function activateEmergencyMode(alertData) {
            const emergencyMode = document.getElementById('emergency-mode');
            const emergencyContent = document.getElementById('emergency-content');

            emergencyContent.innerHTML = `
                <h3>${alertData.title}</h3>
                <p style="font-size: 1.2rem; margin: 20px 0;">${alertData.message}</p>
                <div class="safety-instructions" style="text-align: left; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <strong>Safety Instructions:</strong>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        ${alertData.safetyInstructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ul>
                </div>
            `;

            emergencyMode.classList.add('active');


            try {
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-buzzer-937.mp3');
                audio.play();
            } catch (e) {
                console.log('Audio play failed:', e);
            }
        }

        function exitEmergencyMode() {
            document.getElementById('emergency-mode').classList.remove('active');
        }

        function shareLocationWithEmergency() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    showNotification(`Location shared with emergency services: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
                });
            }
        }

        function checkEmergencyAlerts() {

            const mockAlerts = [
                {
                    active: Math.random() > 0.9, // 10% chance of alert
                    title: "Severe Thunderstorm Warning",
                    message: "Tornado warning in effect until 5:00 PM",
                    safetyInstructions: [
                        "Go to basement or interior room",
                        "Avoid windows",
                        "Monitor local news",
                        "Stay away from electrical equipment"
                    ]
                }
            ];

            const activeAlert = mockAlerts.find(alert => alert.active);
            if (activeAlert) {
                activateEmergencyMode(activeAlert);
            }
        }


        function loadWeatherEducation() {
            const container = document.getElementById('episode-list');
            const episodes = [
                {
                    title: "Understanding Hurricanes",
                    description: "Learn how hurricanes form and their impact.",
                    duration: "15 min"
                },
                {
                    title: "Cloud Types Explained",
                    description: "Identify different cloud formations and what they mean.",
                    duration: "12 min"
                },
                {
                    title: "Climate Change Basics",
                    description: "Understanding the science behind climate change.",
                    duration: "20 min"
                }
            ];

            container.innerHTML = episodes.map(episode => `
                <div class="episode">
                    <h4>${episode.title}</h4>
                    <p>${episode.description}</p>
                    <small>Duration: ${episode.duration}</small>
                    <button class="export-btn" style="margin-top: 10px;">
                        <i class="fas fa-play"></i> Play
                    </button>
                </div>
            `).join('');
        }


        function loadAnalyticsDashboard(weatherData) {
            const container = document.getElementById('analytics-grid');
            if (!weatherData || !weatherData.daily) return;

            const temps = weatherData.daily.temperature_2m_max;
            const avgTemp = temps.reduce((a, b) => a + b) / temps.length;
            const maxTemp = Math.max(...temps);
            const minTemp = Math.min(...temps);

            container.innerHTML = `
                <div class="metric-card">
                    <h4>Temperature Variance</h4>
                    <div class="metric-value">±${(maxTemp - minTemp).toFixed(1)}°C</div>
                    <div class="metric-trend" style="color: var(--success);">Stable</div>
                </div>
                <div class="metric-card">
                    <h4>Humidity</h4>
                    <div class="metric-value">${weatherData.current.relative_humidity_2m}%</div>
                    <div class="metric-detail">Relative humidity</div>
                </div>
                <div class="metric-card">
                    <h4>Wind Consistency</h4>
                    <div class="metric-value">Moderate</div>
                    <div class="metric-detail">${weatherData.current.wind_speed_10m} km/h</div>
                </div>
            `;
        }



        const themeToggle = document.getElementById('theme-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        function initTheme() {
            const savedTheme = localStorage.getItem('theme');

            if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);


            if (currentWeatherData) {
                renderWeatherCharts(currentWeatherData);
            }
        }

        themeToggle.addEventListener('click', toggleTheme);
        document.addEventListener('DOMContentLoaded', initTheme);

        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });


        const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
        const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
        const HISTORICAL_WEATHER_URL = 'https://archive-api.open-meteo.com/v1/archive';

        const cityInput = document.getElementById('city-input');
        const searchBtn = document.getElementById('search-btn');
        const locationBtn = document.getElementById('location-btn');
        const voiceSearchBtn = document.getElementById('voice-search-btn');
        const mainContent = document.getElementById('main-content');
        const loader = document.getElementById('loader');
        const errorMessage = document.getElementById('error-message');
        const celsiusBtn = document.getElementById('celsius-btn');
        const fahrenheitBtn = document.getElementById('fahrenheit-btn');
        const exportPdfBtn = document.getElementById('export-pdf');
        const shareWeatherBtn = document.getElementById('share-weather');
        const saveLocationBtn = document.getElementById('save-location');
        const clearHistoryBtn = document.getElementById('clear-history-btn');


        let currentUnit = 'metric';
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
        let currentWeatherData = null;
        let weatherChart = null;
        let historicalWeatherChart = null;


        document.addEventListener('DOMContentLoaded', function () {
            updateDateTime();
            setInterval(updateDateTime, 60000);

            updateFooterTimestamp();
            setInterval(updateFooterTimestamp, 1000);

            const lastCity = localStorage.getItem('lastCity') || 'New York';
            getCoordinates(lastCity);

            renderRecentSearches();
            updateSavedLocationsButton();


            loadAchievements();
            loadWeatherQuiz();
            updateComparisonGrid();
            loadWeatherEducation();
            updateOnlineStatus();


            searchBtn.addEventListener('click', handleSearch);
            locationBtn.addEventListener('click', handleLocation);
            voiceSearchBtn.addEventListener('click', handleVoiceSearch);
            cityInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') handleSearch();
            });

            celsiusBtn.addEventListener('click', () => switchUnit('metric'));
            fahrenheitBtn.addEventListener('click', () => switchUnit('imperial'));

            exportPdfBtn.addEventListener('click', exportAsPDF);
            shareWeatherBtn.addEventListener('click', shareWeather);
            saveLocationBtn.addEventListener('click', saveCurrentLocation);
            clearHistoryBtn.addEventListener('click', clearRecentSearches);


            const hourlyContainer = document.getElementById('hourly-forecast');
            hourlyContainer.setAttribute('tabindex', '0');
            hourlyContainer.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    hourlyContainer.scrollLeft -= 100;
                } else if (e.key === 'ArrowRight') {
                    hourlyContainer.scrollLeft += 100;
                }
            });


            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            } else {
                voiceSearchBtn.style.display = 'none';
            }


            setInterval(checkEmergencyAlerts, 5 * 60 * 1000);
            checkEmergencyAlerts();


            updateAllText();
        });


        function updateDateTime() {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            document.getElementById('current-date-time').textContent = now.toLocaleDateString('en-US', options);
        }


        function updateFooterTimestamp() {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            const timestamp = now.toLocaleDateString('en-US', options);
            document.getElementById('footer-timestamp').textContent = `Last updated: ${timestamp}`;
        }


        function handleSearch() {
            const city = cityInput.value.trim();
            if (city) {
                getCoordinates(city);
                cityInput.value = '';
            } else {
                showError('Please enter a city name');
            }
        }


        function handleLocation() {
            if (navigator.geolocation) {
                showLoader();
                navigator.geolocation.getCurrentPosition(
                    async position => {
                        const { latitude, longitude } = position.coords;


                        try {
                            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                            const geoData = await res.json();
                            const cityName = geoData.city || geoData.locality || "Current Location";
                            const countryName = geoData.countryCode || "";
                            currentWeatherData = { location: { name: cityName, country: countryName, latitude, longitude } };
                        } catch (e) {
                            console.warn("Reverse Geocoding failed", e);
                        }

                        getWeather(latitude, longitude);
                    },
                    error => {
                        hideLoader();
                        showError('Unable to retrieve your location. Please enable location services.');
                    }
                );
            } else {
                showError('Geolocation is not supported by your browser');
            }
        }


        function handleVoiceSearch() {
            if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                showError('Voice search is not supported in your browser');
                return;
            }

            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            voiceSearchBtn.classList.add('listening');
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                cityInput.value = transcript;
                getCoordinates(transcript);
                voiceSearchBtn.classList.remove('listening');
            };

            recognition.onerror = (event) => {
                showError('Voice recognition error: ' + event.error);
                voiceSearchBtn.classList.remove('listening');
            };

            recognition.onend = () => {
                voiceSearchBtn.classList.remove('listening');
            };
        }


        async function getCoordinates(city) {
            showLoader();
            try {
                const response = await fetch(`${GEO_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
                const data = await response.json();

                if (!data.results || data.results.length === 0) {
                    throw new Error('City not found. Please try again.');
                }

                const { latitude, longitude, name, country } = data.results[0];


                currentWeatherData = { location: { name, country, latitude, longitude } };


                await getWeather(latitude, longitude);

                addToRecentSearches(name, country);
                localStorage.setItem('lastCity', name);
            } catch (error) {
                hideLoader();
                showError(error.message);
            }
        }


        async function getWeather(lat, lon) {
            showLoader();
            try {
                const response = await fetch(
                    `${WEATHER_BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapor_pressure_deficit,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=auto`
                );

                if (!response.ok) throw new Error('Weather data unavailable.');

                const data = await response.json();


                if (currentWeatherData && currentWeatherData.location) {
                    data.location = currentWeatherData.location;
                } else {
                    data.location = { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: '' };
                }

                currentWeatherData = data;

                updateCurrentWeather(data);
                updateForecast(data);
                updateHourlyForecast(data);
                updateAstronomyData(data);
                renderWeatherCharts(data);


                fetchAirQuality(lat, lon);

                updateWeatherAlerts(data);
                updateClothingRecommendations(data);
                updateWeatherMap(data);


                generateAIInsights(data);
                generateHealthTips(data);
                fetchHistoricalData(lat, lon);

                hideLoader();
                showMainContent();
            } catch (error) {
                hideLoader();
                showError(error.message);
            }
        }


        function getWeatherDescription(code) {
            const interpretations = {
                0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
                55: "Dense drizzle", 56: "Light freezing drizzle", 57: "Dense freezing drizzle",
                61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Light freezing rain",
                67: "Heavy freezing rain", 71: "Slight snow fall", 73: "Moderate snow fall",
                75: "Heavy snow fall", 77: "Snow grains", 80: "Slight rain showers",
                81: "Moderate rain showers", 82: "Violent rain showers", 85: "Slight snow showers",
                86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with slight hail",
                99: "Thunderstorm with heavy hail"
            };
            return interpretations[code] || "Unknown";
        }


        function getWMOIcon(code, isDay = 1) {
            const icons = {
                0: isDay ? "fa-sun" : "fa-moon",
                1: isDay ? "fa-cloud-sun" : "fa-cloud-moon",
                2: isDay ? "fa-cloud-sun" : "fa-cloud-moon",
                3: "fa-cloud",
                45: "fa-smog", 48: "fa-smog",
                51: "fa-cloud-rain", 53: "fa-cloud-rain", 55: "fa-cloud-rain",
                56: "fa-cloud-rain", 57: "fa-cloud-rain",
                61: "fa-cloud-showers-heavy", 63: "fa-cloud-showers-heavy", 65: "fa-cloud-showers-heavy",
                66: "fa-cloud-showers-heavy", 67: "fa-cloud-showers-heavy",
                71: "fa-snowflake", 73: "fa-snowflake", 75: "fa-snowflake",
                77: "fa-snowflake",
                80: "fa-cloud-rain", 81: "fa-cloud-rain", 82: "fa-cloud-rain",
                85: "fa-snowflake", 86: "fa-snowflake",
                95: "fa-bolt", 96: "fa-bolt", 99: "fa-bolt"
            };
            return icons[code] || "fa-question";
        }


        function updateCurrentWeather(data) {
            const current = data.current;
            const location = data.location;

            document.getElementById('city-name').textContent = `${location.name}${location.country ? ', ' + location.country : ''}`;

            let temp = current.temperature_2m;
            if (currentUnit === 'imperial') {
                temp = (temp * 9 / 5) + 32;
            }

            document.getElementById('current-temp').textContent = Math.round(temp);
            document.getElementById('temp-unit').textContent = currentUnit === 'metric' ? 'C' : 'F';

            const desc = getWeatherDescription(current.weather_code);
            document.getElementById('weather-description').textContent = desc;

            const windSpeed = currentUnit === 'metric' ? `${current.wind_speed_10m} km/h` : `${(current.wind_speed_10m * 0.621371).toFixed(1)} mph`;
            document.getElementById('wind-speed').textContent = windSpeed;
            document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;

            let feelsLike = current.apparent_temperature;
            if (currentUnit === 'imperial') {
                feelsLike = (feelsLike * 9 / 5) + 32;
            }
            document.getElementById('feels-like').textContent = `${Math.round(feelsLike)}°${document.getElementById('temp-unit').textContent}`;
            document.getElementById('pressure').textContent = `${current.pressure_msl} hPa`;

            const weatherIcon = document.getElementById('weather-icon');
            const iconClass = getWMOIcon(current.weather_code, current.is_day);
            weatherIcon.className = `fas ${iconClass}`;

            updateWeatherBackground(desc.toLowerCase());
        }


        function updateForecast(data) {
            const forecastDaysContainer = document.getElementById('forecast-days');
            forecastDaysContainer.innerHTML = '';

            const daily = data.daily;
            for (let i = 0; i < 5; i++) {
                const date = new Date(daily.time[i]);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                let tempMax = daily.temperature_2m_max[i];
                let tempMin = daily.temperature_2m_min[i];

                if (currentUnit === 'imperial') {
                    tempMax = (tempMax * 9 / 5) + 32;
                    tempMin = (tempMin * 9 / 5) + 32;
                }

                const iconClass = getWMOIcon(daily.weather_code[i], 1);

                const forecastDayHTML = `
                    <div class="forecast-day">
                        <div class="day">${dayName}</div>
                        <div class="date">${dayMonth}</div>
                        <div class="weather-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="forecast-temp">
                            <div class="temp-high">${Math.round(tempMax)}°</div>
                            <div class="temp-low">${Math.round(tempMin)}°</div>
                        </div>
                        <div class="weather-desc">${getWeatherDescription(daily.weather_code[i])}</div>
                    </div>
                `;

                forecastDaysContainer.innerHTML += forecastDayHTML;
            }
        }


        function updateHourlyForecast(data) {
            const hourlyContainer = document.getElementById('hourly-forecast');
            hourlyContainer.innerHTML = '';

            const hourly = data.hourly;
            const now = new Date();
            const currentHour = now.getHours();


            for (let i = currentHour; i < currentHour + 24; i++) {
                const timeStr = hourly.time[i];
                if (!timeStr) break;

                const date = new Date(timeStr);
                const displayTime = date.toLocaleTimeString([], { hour: 'numeric', hour12: true });

                let temp = hourly.temperature_2m[i];
                if (currentUnit === 'imperial') {
                    temp = (temp * 9 / 5) + 32;
                }

                const iconClass = getWMOIcon(hourly.weather_code[i], hourly.is_day ? hourly.is_day[i] : 1);

                const hourlyItemHTML = `
                    <div class="hourly-item" tabindex="0">
                        <div class="time">${displayTime}</div>
                        <div class="weather-icon">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="temp">${Math.round(temp)}°</div>
                    </div>
                `;

                hourlyContainer.innerHTML += hourlyItemHTML;
            }
        }


        function updateAstronomyData(data) {
            const daily = data.daily;
            if (!daily || !daily.sunrise) return;


            const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sunset = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            document.getElementById('sunrise-time').textContent = sunrise;
            document.getElementById('sunset-time').textContent = sunset;
            document.getElementById('moon-phase').textContent = getMoonPhase(new Date());

            const duration = daily.daylight_duration[0]; // in seconds
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            document.getElementById('day-length').textContent = `${hours}h ${minutes}m`;
        }


        function getMoonPhase(date) {
            const lp = 2551443;
            const now = new Date(date);
            const new_moon = new Date('1970-01-07T00:00:00Z');
            const phase = ((now.getTime() - new_moon.getTime()) / 1000) % lp;
            const res = Math.floor((phase / lp) * 8);
            const phases = [
                'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
                'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
            ];
            return phases[res];
        }


        function updateWeatherAlerts(data) {
            const alertsContainer = document.getElementById('weather-alerts');
            alertsContainer.innerHTML = '';

            const hourly = data.hourly;
            let hasAlert = false;


            for (let i = 0; i < 24; i++) {
                const precip = hourly.precipitation[i];
                const prob = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

                if (precip > 5 || prob > 70) {
                    const alertHTML = `
                        <div class="alert-item severe">
                            <div class="alert-title">
                                <i class="fas fa-cloud-showers-heavy"></i>
                                Rain Alert
                            </div>
                            <div class="alert-message">
                                Heavy precipitation expected (${precip}mm, ${prob}% probability)
                            </div>
                        </div>
                    `;
                    alertsContainer.innerHTML = alertHTML; // Show only one for now
                    hasAlert = true;
                    break;
                }
            }

            if (!hasAlert) {
                alertsContainer.innerHTML = `
                    <div class="alert-item info">
                        <div class="alert-title">
                            <i class="fas fa-info-circle"></i>
                            No Active Alerts
                        </div>
                        <div class="alert-message">
                            No severe weather alerts for this location.
                        </div>
                    </div>
                `;
            }
        }


        function updateClothingRecommendations(data) {
            const clothingContainer = document.getElementById('clothing-items');
            if (!clothingContainer) return;
            clothingContainer.innerHTML = '';

            const current = data.current;
            const currentTemp = current.temperature_2m;
            const code = current.weather_code;
            const weatherDesc = getWeatherDescription(code).toLowerCase();
            const windSpeed = current.wind_speed_10m;

            const clothingItems = [];


            if (currentTemp > 25) {
                clothingItems.push({ icon: 'fa-tshirt', text: 'Light shirt' });
                clothingItems.push({ icon: 'fa-sun', text: 'Sunglasses' });
                clothingItems.push({ icon: 'fa-hat-cowboy', text: 'Hat' });
            } else if (currentTemp > 15) {
                clothingItems.push({ icon: 'fa-tshirt', text: 'T-shirt' });
                clothingItems.push({ icon: 'fa-jacket', text: 'Light jacket' });
            } else if (currentTemp > 5) {
                clothingItems.push({ icon: 'fa-sweater', text: 'Sweater' });
                clothingItems.push({ icon: 'fa-jacket', text: 'Jacket' });
            } else {
                clothingItems.push({ icon: 'fa-snowflake', text: 'Winter coat' });
                clothingItems.push({ icon: 'fa-mitten', text: 'Gloves' });
                clothingItems.push({ icon: 'fa-hat-winter', text: 'Winter hat' });
            }


            if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle') || weatherDesc.includes('shower')) {
                clothingItems.push({ icon: 'fa-umbrella', text: 'Umbrella' });
                clothingItems.push({ icon: 'fa-water', text: 'Raincoat' });
            }

            if (weatherDesc.includes('snow') || weatherDesc.includes('ice') || weatherDesc.includes('grains')) {
                clothingItems.push({ icon: 'fa-snowman', text: 'Snow boots' });
            }

            if (windSpeed > 20) {
                clothingItems.push({ icon: 'fa-wind', text: 'Windbreaker' });
            }


            clothingItems.forEach(item => {
                const clothingHTML = `
                    <div class="clothing-item">
                        <i class="fas ${item.icon}"></i>
                        <span>${item.text}</span>
                    </div>
                `;
                clothingContainer.innerHTML += clothingHTML;
            });
        }


        function updateWeatherMap(data) {
            const lat = data.location.latitude;
            const lon = data.location.longitude;

            const mapIframe = document.getElementById('weather-map');
            if (mapIframe) {
                mapIframe.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=5&level=surface&overlay=wind&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;
            }
        }


        function renderWeatherCharts(data) {
            const ctx = document.getElementById('weatherChartCanvas').getContext('2d');
            const hourly = data.hourly;


            const timeLabels = hourly.time.slice(0, 24).map(t => new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: true }));
            let temps = hourly.temperature_2m.slice(0, 24);
            const rain = hourly.precipitation.slice(0, 24);

            if (currentUnit === 'imperial') {
                temps = temps.map(t => (t * 9 / 5) + 32);
            }

            if (weatherChart) {
                weatherChart.destroy();
            }

            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();

            weatherChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timeLabels,
                    datasets: [
                        {
                            label: `Temp (${currentUnit === 'metric' ? '°C' : '°F'})`,
                            data: temps,
                            borderColor: accentColor,
                            backgroundColor: 'rgba(50, 161, 206, 0.2)',
                            yAxisID: 'y',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Rain (mm)',
                            data: rain,
                            borderColor: secondaryColor,
                            backgroundColor: 'rgba(22, 116, 136, 0.6)',
                            type: 'bar',
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Temperature', color: textColor },
                            ticks: { color: textColor }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: 'Precipitation (mm)', color: textColor },
                            ticks: { color: textColor }
                        },
                        x: {
                            ticks: { color: textColor }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor
                            }
                        }
                    }
                }
            });
        }


        function renderHistoricalWeatherChart(data) {
            const ctx = document.getElementById('historicalWeatherChartCanvas').getContext('2d');
            const daily = data.daily;

            const timeLabels = daily.time.map(t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            let tempsMax = daily.temperature_2m_max;
            let tempsMin = daily.temperature_2m_min;
            const rain = daily.precipitation_sum;

            if (currentUnit === 'imperial') {
                tempsMax = tempsMax.map(t => (t * 9 / 5) + 32);
                tempsMin = tempsMin.map(t => (t * 9 / 5) + 32);
            }

            if (historicalWeatherChart) {
                historicalWeatherChart.destroy();
            }

            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();

            historicalWeatherChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: timeLabels,
                    datasets: [
                        {
                            label: `Max Temp (${currentUnit === 'metric' ? '°C' : '°F'})`,
                            data: tempsMax,
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: `Min Temp (${currentUnit === 'metric' ? '°C' : '°F'})`,
                            data: tempsMin,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Rain (mm)',
                            data: rain,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            yAxisID: 'y1',
                            type: 'line',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Temperature', color: textColor },
                            ticks: { color: textColor }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: 'Precipitation (mm)', color: textColor },
                            ticks: { color: textColor }
                        },
                        x: {
                            ticks: { color: textColor }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor
                            }
                        }
                    }
                }
            });

            const avgHigh = tempsMax.reduce((a, b) => a + b, 0) / tempsMax.length;
            const avgLow = tempsMin.reduce((a, b) => a + b, 0) / tempsMin.length;
            const rainyDays = rain.filter(r => r > 0).length;

            document.getElementById('trend-stats').innerHTML = `
                <div>Avg High: <span>${avgHigh.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}</span></div>
                <div>Avg Low: <span>${avgLow.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}</span></div>
                <div>Rainy Days: <span>${rainyDays}</span></div>
            `;
        }


        async function fetchHistoricalData(lat, lon) {
            const today = new Date();
            const endDate = today.toISOString().split('T')[0];
            today.setDate(today.getDate() - 30);
            const startDate = today.toISOString().split('T')[0];

            try {
                const response = await fetch(`${HISTORICAL_WEATHER_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
                if (!response.ok) return;
                const data = await response.json();
                renderHistoricalWeatherChart(data);
            } catch (error) {
                console.error("Historical Data Error:", error);
            }
        }

        function updateWeatherBackground(weatherDesc) {
            const background = document.getElementById('weather-background');
            background.className = 'weather-background';

            if (weatherDesc.includes('sun') || weatherDesc.includes('clear')) {
                background.classList.add('sunny-bg');
            } else if (weatherDesc.includes('rain') || weatherDesc.includes('storm')) {
                background.classList.add('rainy-bg');
            } else if (weatherDesc.includes('cloud')) {
                background.classList.add('cloudy-bg');
            } else {
                background.classList.add('sunny-bg');
            }
        }


        async function fetchAirQuality(lat, lon) {
            try {
                const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10`);
                if (!response.ok) return;
                const data = await response.json();
                updateAirQuality(data);
            } catch (error) {
                console.error("AQI Error:", error);
            }
        }


        function updateAirQuality(data) {
            const current = data.current;
            if (!current) return;

            const aqiValue = document.getElementById('aqi-value');
            const aqiStatus = document.getElementById('aqi-status');
            const aqiDescription = document.getElementById('aqi-description');

            if (!aqiValue) return;

            const aqi = current.european_aqi;
            aqiValue.textContent = Math.round(aqi);

            aqiValue.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy');

            if (aqi <= 20) {
                aqiValue.classList.add('aqi-good');
                aqiStatus.textContent = 'Good';
                aqiDescription.textContent = 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
            } else if (aqi <= 40) {
                aqiValue.classList.add('aqi-moderate');
                aqiStatus.textContent = 'Fair';
                aqiDescription.textContent = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern.';
            } else if (aqi <= 60) {
                aqiValue.classList.add('aqi-moderate');
                aqiStatus.textContent = 'Moderate';
                aqiDescription.textContent = 'Members of sensitive groups may experience health effects.';
            } else {
                aqiValue.classList.add('aqi-unhealthy');
                aqiStatus.textContent = 'Poor';
                aqiDescription.textContent = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
            }
        }


        function addToRecentSearches(city, country) {
            const searchItem = `${city}, ${country}`;

            recentSearches = recentSearches.filter(item => item !== searchItem);
            recentSearches.unshift(searchItem);

            if (recentSearches.length > 5) {
                recentSearches.pop();
            }

            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            renderRecentSearches();
        }


        function renderRecentSearches() {
            const recentList = document.getElementById('recent-searches');
            recentList.innerHTML = '';

            recentSearches.forEach(city => {
                const recentItem = document.createElement('div');
                recentItem.className = 'recent-item';
                recentItem.innerHTML = `<i class="fas fa-history"></i> ${city}`;
                recentItem.tabIndex = 0;
                recentItem.addEventListener('click', () => {
                    const cityName = city.split(',')[0];
                    getCoordinates(cityName);
                });
                recentItem.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const cityName = city.split(',')[0];
                        getCoordinates(cityName);
                    }
                });

                recentList.appendChild(recentItem);
            });
        }

        function clearRecentSearches() {
            recentSearches = [];
            localStorage.removeItem('recentSearches');
            renderRecentSearches();
            showNotification('Search history cleared.', 'success');
        }


        function saveCurrentLocation() {
            if (!currentWeatherData || !currentWeatherData.location) {
                showError('No weather data available to save');
                return;
            }

            const loc = currentWeatherData.location;
            const locationString = `${loc.name}${loc.country ? ', ' + loc.country : ''}`;

            if (!savedLocations.includes(locationString)) {
                savedLocations.push(locationString);
                localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
                updateSavedLocationsButton();
                showNotification(`Saved ${locationString} to your locations`, 'success');
            } else {
                showNotification(`${locationString} is already saved`, 'info');
            }
        }


        function updateSavedLocationsButton() {
            if (!currentWeatherData || !currentWeatherData.location) return;

            const loc = currentWeatherData.location;
            const locationString = `${loc.name}${loc.country ? ', ' + loc.country : ''}`;

            if (savedLocations.includes(locationString)) {
                saveLocationBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                saveLocationBtn.disabled = true;
            } else {
                saveLocationBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save Location';
                saveLocationBtn.disabled = false;
            }
        }


        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `alert-item ${type}`;
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '1000';
            
            let iconClass = 'fa-info-circle';
            if(type === 'success') iconClass = 'fa-check-circle';
            if(type === 'error') iconClass = 'fa-exclamation-circle';

            notification.innerHTML = `
                <div class="alert-title">
                    <i class="fas ${iconClass}"></i>
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <div class="alert-message">${message}</div>
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }


        function switchUnit(unit) {
            if (unit === currentUnit) return;

            currentUnit = unit;
            localStorage.setItem('weatherUnit', unit);

            if (unit === 'metric') {
                celsiusBtn.classList.add('active');
                fahrenheitBtn.classList.remove('active');
            } else {
                celsiusBtn.classList.remove('active');
                fahrenheitBtn.classList.add('active');
            }

            const currentCityElement = document.getElementById('city-name');
            if (currentCityElement && currentCityElement.textContent) {
                const currentCity = currentCityElement.textContent.split(',')[0].trim();
                getCoordinates(currentCity);
            }
        }


        function exportAsPDF() {
            const { jsPDF } = window.jspdf;


            const btnOriginalText = exportPdfBtn.innerHTML;
            exportPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            html2canvas(document.querySelector("#main-content")).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`WeatherReport-${document.getElementById('city-name').textContent.split(',')[0]}.pdf`);

                exportPdfBtn.innerHTML = btnOriginalText;
                showNotification('Weather report downloaded', 'success');
            });
        }


        function shareWeather() {
            const city = document.getElementById('city-name').textContent;
            const temp = document.getElementById('current-temp').textContent;
            const unit = document.getElementById('temp-unit').textContent;
            const description = document.getElementById('weather-description').textContent;

            const text = `Current weather in ${city}: ${temp}°${unit} and ${description}. Check it out on WeatherCast Pro!`;

            if (navigator.share) {
                navigator.share({
                    title: `Weather in ${city}`,
                    text: text,
                    url: window.location.href
                });
            } else {

                navigator.clipboard.writeText(text).then(() => {
                    showNotification('Weather info copied to clipboard!', 'success');
                });
            }
        }




        function showLoader() {
            loader.style.display = 'block';
            mainContent.style.display = 'none';
            errorMessage.style.display = 'none';
        }

        function hideLoader() {
            loader.style.display = 'none';
        }

        function showMainContent() {
            mainContent.style.display = 'grid';
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            mainContent.style.display = 'none';
            loader.style.display = 'none';

            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }


        function initializePreferences() {
            const savedUnit = localStorage.getItem('weatherUnit');
            if (savedUnit) {
                switchUnit(savedUnit);
            }
        }

        initializePreferences();
    
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('service-worker.js').then(function (registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function (err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }


        const serviceWorkerContent = `
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('weather-cache-v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
                'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500&display=swap'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = ['weather-cache-v1'];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
        `;


        function createServiceWorker() {
            const blob = new Blob([serviceWorkerContent], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'service-worker.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }


        const manifestContent = {
            "name": "WeatherCast Pro",
            "short_name": "WeatherCast",
            "description": "Live weather forecasts with AI predictions",
            "start_url": "/",
            "display": "standalone",
            "theme_color": "#32a1ce",
            "background_color": "#1a1a2e",
            "icons": [
                {
                    "src": "/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        };

        function createManifest() {
            const blob = new Blob([JSON.stringify(manifestContent, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'manifest.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }


        document.addEventListener('DOMContentLoaded', function () {
            if (!localStorage.getItem('pwaFilesCreated')) {
                setTimeout(() => {
                    createServiceWorker();
                    createManifest();
                    localStorage.setItem('pwaFilesCreated', 'true');
                    console.log('PWA files created successfully');
                }, 1000);
            }
        });
