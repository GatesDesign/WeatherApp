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
        airQuality: "Qualité de l'Air",
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
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
}

function activateFeature(feature, triggerButton = null) {
    document.querySelectorAll('.feature-section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetSection = document.getElementById(`${feature}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const activeButton = triggerButton || document.querySelector(`.feature-btn[data-feature="${feature}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    trackFeatureVisit(feature);
}

function showFeature(feature, triggerButton) {
    const fallbackButton = typeof event !== 'undefined'
        ? event.currentTarget || event.target?.closest?.('.feature-btn')
        : null;

    activateFeature(feature, triggerButton || fallbackButton);
}

function generateAIInsights(weatherData) {
    const container = document.getElementById('ai-insights-content');
    if (!container) return;
    container.innerHTML = '';

    try {
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
    } catch (error) {
        console.error('Error generating AI insights:', error);
        container.innerHTML = '<p>Unable to generate AI insights at this time.</p>';
    }
}

function getTemperatureInsight(data) {
    if (!data.daily || !data.daily.temperature_2m_max || !Array.isArray(data.daily.temperature_2m_max) || data.daily.temperature_2m_max.length === 0) {
        return "Temperature data unavailable.";
    }
    if (!data.current || typeof data.current.temperature_2m !== 'number') {
        return "Current temperature data unavailable.";
    }
    const temps = data.daily.temperature_2m_max;
    const currentTemp = data.current.temperature_2m;
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    if (currentTemp > avgTemp + 3) {
        return "Temperature is significantly above average. Expect continued warm conditions.";
    } else if (currentTemp < avgTemp - 3) {
        return "Temperature is below average. Cooling trend expected to continue.";
    } else {
        return "Temperature stable near seasonal averages.";
    }
}

function getRainInsight(data) {
    if (!data.daily || !data.daily.precipitation_probability_max || !Array.isArray(data.daily.precipitation_probability_max)) {
        return "Rain forecast data unavailable.";
    }
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
    if (!data.current || typeof data.current.wind_speed_10m !== 'number') {
        return "Wind data unavailable.";
    }
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
    if (!data.daily || !data.daily.uv_index_max || !Array.isArray(data.daily.uv_index_max)) {
        return "UV data unavailable.";
    }
    const uvIndex = data.daily.uv_index_max[0] || 5;

    if (uvIndex > 8) {
        return "Extreme UV levels. Maximum protection required.";
    } else if (uvIndex > 6) {
        return "High UV radiation. Sunscreen recommended.";
    } else {
        return "Moderate UV levels. Standard protection sufficient.";
    }
}

const MAX_COMPARISON_CITIES = 5;
let comparedCities = normalizeComparedCities(JSON.parse(localStorage.getItem('comparedCities')) || []);

function normalizeComparedLocation(location) {
    if (!location) return null;

    if (typeof location === 'string') {
        const label = location.trim();
        if (!label) return null;

        const [namePart, ...countryParts] = label.split(',');
        const name = namePart.trim();
        const country = countryParts.join(',').trim();

        if (!name) return null;

        return {
            id: createLocationId(name, country),
            query: label,
            name,
            country,
            latitude: null,
            longitude: null
        };
    }

    if (typeof location !== 'object') return null;

    const name = String(location.name || location.query || '').trim();
    const country = String(location.country || '').trim();

    if (!name) return null;

    return {
        id: String(location.id || createLocationId(name, country)),
        query: String(location.query || getLocationLabel({ name, country })).trim(),
        name,
        country,
        latitude: typeof location.latitude === 'number' ? location.latitude : null,
        longitude: typeof location.longitude === 'number' ? location.longitude : null
    };
}

function normalizeComparedCities(locations) {
    const seenLabels = new Set();

    return (Array.isArray(locations) ? locations : [])
        .map(normalizeComparedLocation)
        .filter(location => {
            if (!location) return false;

            const labelKey = getLocationLabel(location).toLowerCase();
            if (seenLabels.has(labelKey)) return false;

            seenLabels.add(labelKey);
            return true;
        });
}

function persistComparedCities() {
    localStorage.setItem('comparedCities', JSON.stringify(comparedCities));
}

function isLocationAlreadyCompared(location) {
    if (!location) return false;

    const label = getLocationLabel(location).toLowerCase();
    const name = location.name.toLowerCase();
    const country = (location.country || '').toLowerCase();

    return comparedCities.some(savedLocation => {
        const savedLabel = getLocationLabel(savedLocation).toLowerCase();
        const savedName = savedLocation.name.toLowerCase();
        const savedCountry = (savedLocation.country || '').toLowerCase();

        return savedLabel === label
            || (
                savedName === name
                && (!savedCountry || !country || savedCountry === country)
            );
    });
}

function setComparisonBusy(isBusy) {
    if (compareAddBtn) {
        compareAddBtn.disabled = isBusy;
        compareAddBtn.innerHTML = isBusy
            ? '<i class="fas fa-spinner fa-spin"></i> Adding...'
            : 'Add';
    }

    if (compareCurrentBtn) {
        compareCurrentBtn.disabled = isBusy;
    }
}

async function resolveComparisonLocation(query) {
    const response = await fetch(`${GEO_BASE_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    if (!response.ok) {
        throw new Error('Unable to find this city right now');
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found. Try a more specific name.');
    }

    const result = data.results[0];
    return normalizeComparedLocation({
        name: result.name,
        country: result.country || '',
        latitude: result.latitude,
        longitude: result.longitude,
        query: `${result.name}${result.country ? `, ${result.country}` : ''}`
    });
}

async function addResolvedLocationToCompare(locationData) {
    const location = normalizeComparedLocation(locationData);
    if (!location) {
        throw new Error('Please choose a valid city to compare.');
    }

    if (isLocationAlreadyCompared(location)) {
        showNotification(`${getLocationLabel(location)} is already in your comparison board`, 'info');
        return;
    }

    if (comparedCities.length >= MAX_COMPARISON_CITIES) {
        showNotification(`You can compare up to ${MAX_COMPARISON_CITIES} cities at a time`, 'info');
        return;
    }

    comparedCities = [...comparedCities, location];
    persistComparedCities();
    renderComparisonQuickPicks();
    await updateComparisonGrid();
    showNotification(`${getLocationLabel(location)} added to your comparison board`, 'success');
}

async function addCityToCompare(locationData = null) {
    if (typeof Event !== 'undefined' && locationData instanceof Event) {
        locationData = null;
    }

    try {
        setComparisonBusy(true);

        let resolvedLocation = null;
        if (locationData && typeof locationData === 'object') {
            resolvedLocation = normalizeComparedLocation(locationData);
        } else if (typeof locationData === 'string' && locationData.trim()) {
            resolvedLocation = await resolveComparisonLocation(locationData.trim());
        } else {
            const city = compareCityInput?.value.trim() || '';
            if (!city) {
                showNotification('Enter a city name to compare', 'info');
                return;
            }

            resolvedLocation = await resolveComparisonLocation(city);
            if (compareCityInput) {
                compareCityInput.value = '';
            }
        }

        await addResolvedLocationToCompare(resolvedLocation);
    } catch (error) {
        showNotification(error.message || 'Unable to add this city right now', 'error');
    } finally {
        setComparisonBusy(false);
    }
}

async function addCurrentCityToCompare() {
    if (!currentWeatherData?.location) {
        showNotification('Load a city in the main weather view first, then add it here', 'info');
        return;
    }

    await addCityToCompare(currentWeatherData.location);
}

function clearComparisonBoard() {
    if (!comparedCities.length) {
        showNotification('Your comparison board is already empty', 'info');
        return;
    }

    comparedCities = [];
    comparisonWeatherCache = {};
    latestComparisonResults = [];
    persistComparedCities();
    updateComparisonGrid();
    showNotification('Comparison board cleared', 'success');
}

function removeCityFromCompare(locationId) {
    const removedLocation = comparedCities.find(location => location.id === locationId);
    comparedCities = comparedCities.filter(location => location.id !== locationId);
    delete comparisonWeatherCache[locationId];
    persistComparedCities();
    updateComparisonGrid();

    if (removedLocation) {
        showNotification(`Removed ${getLocationLabel(removedLocation)} from comparison`, 'info');
    }
}

async function openComparedCity(locationId) {
    const location = comparedCities.find(item => item.id === locationId);
    if (!location) return;

    activateFeature('weather');

    if (cityInput) {
        cityInput.value = getLocationLabel(location);
    }

    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        await loadSelectedLocation(location);
        return;
    }

    await getCoordinates(getLocationLabel(location));
}

function renderComparisonQuickPicks() {
    const container = document.getElementById('comparison-quick-picks');
    if (!container) return;

    const quickPicks = [];
    const seenQuickPickIds = new Set();

    if (currentWeatherData?.location) {
        const currentLocation = normalizeComparedLocation(currentWeatherData.location);
        if (currentLocation) {
            seenQuickPickIds.add(currentLocation.id);
            quickPicks.push({
                ...currentLocation,
                source: 'Current city',
                disabled: isLocationAlreadyCompared(currentLocation)
            });
        }
    }

    savedLocations.forEach(location => {
        const savedLocation = normalizeComparedLocation(location);
        if (!savedLocation || seenQuickPickIds.has(savedLocation.id)) return;

        seenQuickPickIds.add(savedLocation.id);
        quickPicks.push({
            ...savedLocation,
            source: 'Saved'
        });
    });

    if (!quickPicks.length) {
        container.innerHTML = `
            <div class="comparison-quick-note">
                Search for cities above, or save favorite locations to unlock one-tap compare shortcuts here.
            </div>
        `;
        return;
    }

    container.innerHTML = quickPicks.slice(0, 6).map(location => `
        <button
            type="button"
            class="comparison-quick-btn${location.disabled ? ' is-disabled' : ''}"
            data-compare-pick="${escapeHtml(location.id)}"
            ${location.disabled ? 'disabled' : ''}
        >
            <span class="comparison-quick-tag">${escapeHtml(location.source)}</span>
            ${escapeHtml(getLocationLabel(location))}
        </button>
    `).join('');

    container.querySelectorAll('[data-compare-pick]').forEach(button => {
        button.addEventListener('click', async () => {
            const location = quickPicks.find(item => item.id === button.getAttribute('data-compare-pick'));
            if (!location) return;
            await addCityToCompare(location);
        });
    });
}

function getComparisonComfortScore(weather) {
    return clampValue(
        Math.round(
            100
            - Math.abs(weather.feelsLike - 22) * 2.3
            - Math.abs(weather.humidity - 55) * 0.45
            - Math.max(0, weather.windSpeed - 20) * 1.25
            - (weather.rainChance * 0.22)
        ),
        0,
        100
    );
}

function getComparisonRiskScore(weather) {
    return clampValue(
        Math.round(
            weather.rainChance
            + Math.max(0, weather.windSpeed - 18) * 2
            + Math.abs(weather.feelsLike - 22) * 1.4
        ),
        0,
        100
    );
}

function renderComparisonOverview(results) {
    const container = document.getElementById('comparison-overview');
    if (!container) return;

    if (results === null) {
        container.innerHTML = `
            <div class="comparison-empty">
                Loading comparison highlights...
            </div>
        `;
        return;
    }

    if (!results.length) {
        container.innerHTML = `
            <div class="comparison-empty">
                Add cities to unlock live summary cards for temperature, rain risk, and comfort.
            </div>
        `;
        return;
    }

    const warmest = results.reduce((current, item) => item.temperature > current.temperature ? item : current, results[0]);
    const rainiest = results.reduce((current, item) => item.rainChance > current.rainChance ? item : current, results[0]);
    const bestComfort = results.reduce(
        (current, item) => getComparisonComfortScore(item) > getComparisonComfortScore(current) ? item : current,
        results[0]
    );

    container.innerHTML = `
        <article class="comparison-summary-card">
            <span class="comparison-summary-label">Cities Compared</span>
            <strong class="comparison-summary-value">${results.length}</strong>
            <span class="comparison-summary-detail">Live board ready for side-by-side decisions</span>
        </article>
        <article class="comparison-summary-card">
            <span class="comparison-summary-label">Warmest Right Now</span>
            <strong class="comparison-summary-value">${formatTemperatureValue(warmest.temperature)}</strong>
            <span class="comparison-summary-detail">${escapeHtml(warmest.name)} is currently the hottest pick</span>
        </article>
        <article class="comparison-summary-card">
            <span class="comparison-summary-label">Highest Rain Risk</span>
            <strong class="comparison-summary-value">${rainiest.rainChance}%</strong>
            <span class="comparison-summary-detail">${escapeHtml(rainiest.name)} needs the most weather caution</span>
        </article>
        <article class="comparison-summary-card">
            <span class="comparison-summary-label">Best Comfort Score</span>
            <strong class="comparison-summary-value">${getComparisonComfortScore(bestComfort)}/100</strong>
            <span class="comparison-summary-detail">${escapeHtml(bestComfort.name)} looks strongest for outdoor plans</span>
        </article>
    `;
}

function renderComparisonInsights(results) {
    const container = document.getElementById('comparison-insights');
    if (!container) return;

    if (results === null) {
        container.innerHTML = `
            <div class="comparison-empty">
                Building smart compare notes...
            </div>
        `;
        return;
    }

    if (!results.length) {
        container.innerHTML = `
            <div class="comparison-empty">
                Smart compare notes will appear once at least one city is on the board.
            </div>
        `;
        return;
    }

    const bestComfort = results.reduce(
        (current, item) => getComparisonComfortScore(item) > getComparisonComfortScore(current) ? item : current,
        results[0]
    );
    const mostRisk = results.reduce(
        (current, item) => getComparisonRiskScore(item) > getComparisonRiskScore(current) ? item : current,
        results[0]
    );
    const coolest = results.reduce((current, item) => item.temperature < current.temperature ? item : current, results[0]);
    const warmest = results.reduce((current, item) => item.temperature > current.temperature ? item : current, results[0]);
    const spread = Math.abs(warmest.temperature - coolest.temperature);
    const displaySpread = currentUnit === 'imperial' ? (spread * 9 / 5) : spread;

    const insights = [
        {
            title: 'Best city right now',
            value: bestComfort.name,
            detail: `Comfort score ${getComparisonComfortScore(bestComfort)}/100 with ${bestComfort.rainChance}% rain risk and ${formatWindSpeed(bestComfort.windSpeed)} winds.`
        },
        {
            title: 'Most weather friction',
            value: mostRisk.name,
            detail: `${mostRisk.rainChance}% rain risk with ${formatWindSpeed(mostRisk.windSpeed)} winds means this city needs the most planning.`
        },
        {
            title: 'Temperature spread',
            value: `${displaySpread.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}`,
            detail: `${warmest.name} is the warmest option while ${coolest.name} is the coolest right now.`
        }
    ];

    container.innerHTML = insights.map(item => `
        <article class="comparison-insight-card">
            <div class="comparison-insight-title">${escapeHtml(item.title)}</div>
            <div class="comparison-insight-value">${escapeHtml(item.value)}</div>
            <div class="comparison-insight-detail">${escapeHtml(item.detail)}</div>
        </article>
    `).join('');
}

function renderComparisonChart(results) {
    const canvas = document.getElementById('comparisonChartCanvas');
    const emptyState = document.getElementById('comparison-chart-empty');
    if (!canvas || !emptyState) return;

    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }

    if (results === null) {
        canvas.style.display = 'none';
        emptyState.style.display = 'grid';
        emptyState.textContent = 'Loading the live comparison chart...';
        return;
    }

    if (!results.length) {
        canvas.style.display = 'none';
        emptyState.style.display = 'grid';
        emptyState.textContent = 'Add cities to see a live chart for temperature, feels-like conditions, and rain risk.';
        return;
    }

    canvas.style.display = 'block';
    emptyState.style.display = 'none';
    emptyState.textContent = '';

    const context = canvas.getContext('2d');
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
    const labels = results.map(item => item.name);
    const temperatureValues = results.map(item => currentUnit === 'imperial'
        ? (item.temperature * 9 / 5) + 32
        : item.temperature
    );
    const feelsLikeValues = results.map(item => currentUnit === 'imperial'
        ? (item.feelsLike * 9 / 5) + 32
        : item.feelsLike
    );
    const rainRiskValues = results.map(item => item.rainChance);

    comparisonChart = new Chart(context, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: `Current Temp (${currentUnit === 'metric' ? '°C' : '°F'})`,
                    data: temperatureValues,
                    backgroundColor: 'rgba(50, 161, 206, 0.65)',
                    borderColor: 'rgba(50, 161, 206, 1)',
                    borderWidth: 1,
                    borderRadius: 10
                },
                {
                    label: `Feels Like (${currentUnit === 'metric' ? '°C' : '°F'})`,
                    data: feelsLikeValues,
                    borderColor: 'rgba(255, 159, 67, 1)',
                    backgroundColor: 'rgba(255, 159, 67, 0.2)',
                    pointBackgroundColor: 'rgba(255, 159, 67, 1)',
                    type: 'line',
                    tension: 0.35,
                    yAxisID: 'y'
                },
                {
                    label: 'Rain Risk (%)',
                    data: rainRiskValues,
                    borderColor: 'rgba(22, 116, 136, 1)',
                    backgroundColor: 'rgba(22, 116, 136, 0.18)',
                    pointBackgroundColor: 'rgba(22, 116, 136, 1)',
                    type: 'line',
                    tension: 0.35,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: borderColor
                    },
                    ticks: {
                        color: textColor
                    },
                    title: {
                        display: true,
                        text: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`,
                        color: textColor
                    }
                },
                y1: {
                    beginAtZero: true,
                    max: 100,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: textColor
                    },
                    title: {
                        display: true,
                        text: 'Rain Risk (%)',
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        color: borderColor
                    },
                    ticks: {
                        color: textColor
                    }
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

function refreshComparedCitiesFromResults(results) {
    if (!results.length) return;

    comparedCities = normalizeComparedCities(comparedCities.map(location => {
        const match = results.find(result => result.location.id === location.id);
        if (!match?.weather) return location;

        return {
            ...location,
            query: `${match.weather.name}${match.weather.country ? `, ${match.weather.country}` : ''}`,
            name: match.weather.name,
            country: match.weather.country || location.country || '',
            latitude: match.weather.latitude,
            longitude: match.weather.longitude
        };
    }));

    persistComparedCities();
    renderComparisonQuickPicks();
}

async function updateComparisonGrid() {
    const grid = document.getElementById('comparison-grid');
    if (!grid) return;

    renderComparisonQuickPicks();
    const requestToken = ++comparisonRequestToken;

    if (!comparedCities.length) {
        latestComparisonResults = [];
        renderComparisonOverview([]);
        renderComparisonInsights([]);
        renderComparisonChart([]);
        grid.innerHTML = `
            <div class="saved-location-empty">
                Add a few cities to compare temperature, feels-like conditions, rain risk, and comfort before you travel, pitch, or plan the day.
            </div>
        `;
        return;
    }

    renderComparisonOverview(null);
    renderComparisonInsights(null);
    renderComparisonChart(null);

    grid.innerHTML = comparedCities.map(location => `
        <article class="comparison-card is-loading">
            <div class="comparison-card-head">
                <div>
                    <h4>${escapeHtml(location.name)}</h4>
                    <div class="comparison-location">${escapeHtml(location.country || 'Fetching live weather...')}</div>
                </div>
                <div class="comparison-score">Loading</div>
            </div>
            <div class="comparison-meta">Refreshing live weather data...</div>
        </article>
    `).join('');

    const comparisonResults = await Promise.all(
        comparedCities.map(async location => {
            try {
                const weather = await fetchComparisonWeather(location);
                return { location, weather };
            } catch (error) {
                return { location, error: error.message || 'Unable to load weather for this city' };
            }
        })
    );

    if (requestToken !== comparisonRequestToken) {
        return;
    }

    const successfulResults = comparisonResults.filter(result => result.weather);
    refreshComparedCitiesFromResults(successfulResults);
    latestComparisonResults = successfulResults.map(result => result.weather);

    renderComparisonOverview(latestComparisonResults);
    renderComparisonInsights(latestComparisonResults);
    renderComparisonChart(latestComparisonResults);

    grid.innerHTML = comparisonResults.map(result => {
        if (result.error) {
            return `
                <article class="comparison-card comparison-card-error">
                    <div class="comparison-card-head">
                        <div>
                            <h4>${escapeHtml(result.location.name)}</h4>
                            <div class="comparison-location">${escapeHtml(result.location.country || 'Weather lookup failed')}</div>
                        </div>
                        <div class="comparison-score error">Retry</div>
                    </div>
                    <div class="comparison-meta">${escapeHtml(result.error)}</div>
                    <div class="comparison-actions">
                        <button type="button" class="comparison-btn secondary" data-retry-compare="${escapeHtml(result.location.id)}">
                            Try Again
                        </button>
                        <button type="button" class="comparison-btn danger" data-remove-city="${escapeHtml(result.location.id)}">
                            Remove
                        </button>
                    </div>
                </article>
            `;
        }

        const weather = result.weather;
        const iconClass = getWMOIcon(weather.weatherCode, weather.isDay);
        const comfortScore = getComparisonComfortScore(weather);

        return `
            <article class="comparison-card">
                <div class="comparison-card-head">
                    <div>
                        <h4>${escapeHtml(weather.name)}</h4>
                        <div class="comparison-location">${escapeHtml(weather.country || result.location.country || 'Live city weather')}</div>
                    </div>
                    <div class="comparison-score">Comfort ${comfortScore}</div>
                </div>
                <div class="weather-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="temp">${formatTemperatureValue(weather.temperature)}</div>
                <div class="condition">${escapeHtml(getWeatherDescription(weather.weatherCode))}</div>
                <div class="comparison-stats">
                    <div class="comparison-stat">
                        <span>Feels Like</span>
                        <strong>${formatTemperatureValue(weather.feelsLike)}</strong>
                    </div>
                    <div class="comparison-stat">
                        <span>Humidity</span>
                        <strong>${weather.humidity}%</strong>
                    </div>
                    <div class="comparison-stat">
                        <span>Wind</span>
                        <strong>${escapeHtml(formatWindSpeed(weather.windSpeed))}</strong>
                    </div>
                    <div class="comparison-stat">
                        <span>Rain Risk</span>
                        <strong>${weather.rainChance}%</strong>
                    </div>
                </div>
                <div class="comparison-meta">
                    High / Low: ${formatTemperatureValue(weather.highTemp)} / ${formatTemperatureValue(weather.lowTemp)}
                </div>
                <div class="comparison-actions">
                    <button type="button" class="comparison-btn primary" data-open-compare="${escapeHtml(result.location.id)}">
                        Open City
                    </button>
                    <button type="button" class="comparison-btn danger" data-remove-city="${escapeHtml(result.location.id)}">
                        Remove
                    </button>
                </div>
            </article>
        `;
    }).join('');

    grid.querySelectorAll('[data-open-compare]').forEach(button => {
        button.addEventListener('click', () => {
            openComparedCity(button.getAttribute('data-open-compare'));
        });
    });

    grid.querySelectorAll('[data-retry-compare]').forEach(button => {
        button.addEventListener('click', () => {
            delete comparisonWeatherCache[button.getAttribute('data-retry-compare')];
            updateComparisonGrid();
        });
    });

    grid.querySelectorAll('[data-remove-city]').forEach(button => {
        button.addEventListener('click', () => {
            removeCityFromCompare(button.getAttribute('data-remove-city'));
        });
    });
}

function clampValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getAirQualityHealthProfile() {
    const aqi = currentAirQualityData?.current?.european_aqi;

    if (typeof aqi !== 'number') {
        return {
            level: 'Loading',
            tone: 'info',
            detail: 'Air quality is still loading for this location.'
        };
    }

    if (aqi <= 20) {
        return {
            level: 'Excellent',
            tone: 'good',
            detail: `AQI ${Math.round(aqi)} with low irritation risk for most people.`
        };
    }

    if (aqi <= 40) {
        return {
            level: 'Fair',
            tone: 'good',
            detail: `AQI ${Math.round(aqi)} and generally safe for normal outdoor activity.`
        };
    }

    if (aqi <= 60) {
        return {
            level: 'Moderate',
            tone: 'warn',
            detail: `AQI ${Math.round(aqi)} and sensitive groups should pace outdoor exposure.`
        };
    }

    return {
        level: 'Poor',
        tone: 'bad',
        detail: `AQI ${Math.round(aqi)} and long outdoor sessions should be reduced if possible.`
    };
}

function getUvHealthProfile(uvIndex) {
    if (uvIndex >= 8) {
        return {
            label: 'Very High',
            tone: 'bad',
            detail: 'Use SPF 30+, sunglasses, and limit direct sun around midday.'
        };
    }

    if (uvIndex >= 6) {
        return {
            label: 'High',
            tone: 'warn',
            detail: 'Sun protection is strongly recommended during peak daylight hours.'
        };
    }

    if (uvIndex >= 3) {
        return {
            label: 'Moderate',
            tone: 'info',
            detail: 'Basic sun protection is helpful for longer outdoor plans.'
        };
    }

    return {
        label: 'Low',
        tone: 'good',
        detail: 'Low UV risk for most people during typical outdoor activity.'
    };
}

function getHydrationTarget(temp, uvIndex, humidity) {
    const liters = 2
        + Math.max(0, temp - 24) * 0.08
        + Math.max(0, uvIndex - 4) * 0.1
        + Math.max(0, humidity - 65) * 0.01;

    return `${liters.toFixed(1)}L`;
}

function getBestHealthWindow(hourly) {
    if (!hourly?.time?.length) {
        return {
            label: 'Unavailable',
            detail: 'Hourly health guidance will appear when more forecast data is ready.',
            score: 0
        };
    }

    const currentIndex = Math.max(
        0,
        hourly.time.findIndex(time => new Date(time) >= new Date())
    );

    let bestWindow = {
        label: 'Unavailable',
        detail: 'No safe window computed yet.',
        score: 0
    };

    for (let i = currentIndex; i < Math.min(currentIndex + 12, hourly.time.length); i++) {
        const temp = hourly.temperature_2m?.[i] ?? 22;
        const humidity = hourly.relative_humidity_2m?.[i] ?? 55;
        const rainChance = hourly.precipitation_probability?.[i] ?? 0;
        const windSpeed = hourly.wind_speed_10m?.[i] ?? 0;
        const comfortPenalty = Math.abs(temp - 22) * 2.2;
        const score = Math.max(0, Math.round(
            100
            - rainChance
            - comfortPenalty
            - (windSpeed * 1.4)
            - Math.abs(humidity - 55) * 0.5
        ));

        if (score > bestWindow.score) {
            bestWindow = {
                label: new Date(hourly.time[i]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                detail: `${rainChance}% rain chance with ${formatWindSpeed(windSpeed)} winds`,
                score
            };
        }
    }

    return bestWindow;
}

function generateHealthTips(weatherData) {
    const summary = document.getElementById('health-summary');
    const container = document.getElementById('health-tips');
    if (!summary || !container || !weatherData?.current || !weatherData?.daily) return;

    const current = weatherData.current;
    const hourly = weatherData.hourly || {};
    const temp = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const uvIndex = weatherData.daily.uv_index_max?.[0] || 0;
    const windSpeed = current.wind_speed_10m;
    const condition = getWeatherDescription(current.weather_code).toLowerCase();
    const rainChance = weatherData.daily.precipitation_probability_max?.[0] || 0;
    const airQuality = getAirQualityHealthProfile();
    const uvProfile = getUvHealthProfile(uvIndex);
    const bestWindow = getBestHealthWindow(hourly);
    const healthScore = clampValue(
        Math.round(
            100
            - Math.abs(feelsLike - 22) * 2.4
            - Math.abs(humidity - 55) * 0.45
            - Math.max(0, uvIndex - 4) * 6
            - Math.max(0, windSpeed - 22) * 1.2
            - rainChance * 0.18
            - (airQuality.tone === 'bad' ? 18 : airQuality.tone === 'warn' ? 8 : 0)
        ),
        0,
        100
    );

    const summaryCards = [
        {
            icon: 'fa-heart-pulse',
            title: 'Wellness Score',
            value: `${healthScore}/100`,
            detail: healthScore >= 75
                ? 'Great conditions for most people outdoors.'
                : healthScore >= 55
                    ? 'Manageable conditions with a few precautions.'
                    : 'Take extra care and shorten outdoor exposure.'
        },
        {
            icon: 'fa-glass-water',
            title: 'Hydration Goal',
            value: getHydrationTarget(feelsLike, uvIndex, humidity),
            detail: `${formatTemperatureValue(feelsLike)} feels-like temperature today.`
        },
        {
            icon: 'fa-sun',
            title: 'Sun Exposure',
            value: uvProfile.label,
            detail: uvProfile.detail
        },
        {
            icon: 'fa-lungs',
            title: 'Breathing Outlook',
            value: airQuality.level,
            detail: airQuality.detail
        }
    ];

    summary.innerHTML = summaryCards.map(card => `
        <article class="health-summary-card">
            <div class="health-summary-icon"><i class="fas ${card.icon}"></i></div>
            <div class="health-summary-label">${escapeHtml(card.title)}</div>
            <div class="health-summary-value">${escapeHtml(card.value)}</div>
            <div class="health-summary-detail">${escapeHtml(card.detail)}</div>
        </article>
    `).join('');

    const tips = [
        {
            icon: feelsLike >= 32 ? 'fa-temperature-full' : feelsLike <= 8 ? 'fa-temperature-empty' : 'fa-temperature-half',
            title: feelsLike >= 32 ? 'Heat Load' : feelsLike <= 8 ? 'Cold Exposure' : 'Temperature Balance',
            level: feelsLike >= 32 ? 'bad' : feelsLike <= 8 ? 'warn' : 'good',
            detail: feelsLike >= 32
                ? 'High heat stress risk. Prioritize shade, lighter clothing, and slower pacing outdoors.'
                : feelsLike <= 8
                    ? 'Cold discomfort is likely. Dress in layers and protect hands and ears.'
                    : 'Temperature looks balanced for normal daily activity with standard precautions.'
        },
        {
            icon: 'fa-droplet',
            title: 'Hydration & Skin',
            level: humidity > 70 || humidity < 30 ? 'warn' : 'good',
            detail: humidity > 70
                ? 'Humid air may feel heavier and reduce comfort during exercise. Drink more water and pace yourself.'
                : humidity < 30
                    ? 'Dry air can irritate skin and airways. Use moisturizer and keep water nearby.'
                    : 'Humidity is in a comfortable range for most routines.'
        },
        {
            icon: 'fa-sun',
            title: 'UV Protection',
            level: uvProfile.tone,
            detail: uvProfile.detail
        },
        {
            icon: 'fa-wind',
            title: 'Air & Breathing',
            level: airQuality.tone === 'info' ? 'warn' : airQuality.tone,
            detail: airQuality.detail
        },
        {
            icon: condition.includes('rain') || condition.includes('storm') ? 'fa-cloud-rain' : 'fa-shoe-prints',
            title: 'Outdoor Safety',
            level: condition.includes('storm') ? 'bad' : condition.includes('rain') || windSpeed > 25 ? 'warn' : 'good',
            detail: condition.includes('storm')
                ? 'Stormy conditions can make travel and exercise risky. Indoor plans are the safest choice.'
                : condition.includes('rain')
                    ? 'Wet surfaces may be slippery. Use waterproof layers and allow more travel time.'
                    : windSpeed > 25
                        ? 'Strong winds can cause eye irritation and reduce cycling or jogging comfort.'
                        : `Best outdoor window is around ${bestWindow.label}. ${bestWindow.detail}`
        }
    ];

    container.innerHTML = tips.map(tip => `
        <article class="health-tip ${tip.level}">
            <div class="health-tip-header">
                <div class="health-tip-icon"><i class="fas ${tip.icon}"></i></div>
                <div>
                    <h4 class="health-tip-title">${escapeHtml(tip.title)}</h4>
                    <span class="health-tip-level">${escapeHtml(tip.level === 'bad' ? 'High Attention' : tip.level === 'warn' ? 'Watch Closely' : 'In Good Range')}</span>
                </div>
            </div>
            <p class="health-tip-detail">${escapeHtml(tip.detail)}</p>
        </article>
    `).join('');

    generateActivityPlanner(weatherData);
}

function generateActivityPlanner(weatherData) {
    const container = document.getElementById('activity-planner');
    if (!container || !weatherData?.current) return;

    const current = weatherData.current;
    const hourly = weatherData.hourly || {};
    const temp = current.temperature_2m;
    const condition = getWeatherDescription(current.weather_code).toLowerCase();
    const windSpeed = current.wind_speed_10m;
    const rainChance = weatherData.daily.precipitation_probability_max?.[0] || 0;
    const humidity = current.relative_humidity_2m;
    const bestWindow = getBestHealthWindow(hourly);

    const outdoorScore = clampValue(
        Math.round(100 - rainChance - Math.abs(temp - 22) * 2 - windSpeed * 1.1 - Math.abs(humidity - 55) * 0.4),
        0,
        100
    );

    const getSuitability = score => {
        if (score >= 80) return 'great';
        if (score >= 62) return 'good';
        if (score >= 42) return 'caution';
        return 'indoor';
    };

    const exerciseSuitability = getSuitability(outdoorScore);
    const walkSuitability = getSuitability(outdoorScore + (humidity > 70 ? -8 : 5));
    const commuteSuitability = getSuitability(outdoorScore - (condition.includes('rain') ? 15 : 0));
    const recoverySuitability = temp > 31 || condition.includes('storm') ? 'indoor' : temp < 10 ? 'caution' : 'good';

    const activities = [
        {
            icon: 'fa-person-running',
            name: 'Outdoor Exercise',
            suitability: exerciseSuitability,
            badge: exerciseSuitability === 'great' ? 'Great Window' : exerciseSuitability === 'good' ? 'Good Window' : exerciseSuitability === 'caution' ? 'Go Light' : 'Take Indoors',
            reason: exerciseSuitability === 'indoor'
                ? 'Current conditions are rough for intense outdoor workouts. A gym, stretch, or indoor cardio session is safer.'
                : `Best time is around ${bestWindow.label}. ${bestWindow.detail}`,
            meta: `Comfort score: ${outdoorScore}/100`
        },
        {
            icon: 'fa-person-walking',
            name: 'Walking & Fresh Air',
            suitability: walkSuitability,
            badge: walkSuitability === 'great' ? 'Excellent' : walkSuitability === 'good' ? 'Comfortable' : walkSuitability === 'caution' ? 'Short Sessions' : 'Indoor Breaks',
            reason: humidity > 70
                ? 'Humidity is elevated, so shorter walks with water breaks will feel better.'
                : condition.includes('rain')
                    ? 'You can still go out, but waterproof gear and careful footing are important.'
                    : 'This forecast supports light movement and a short reset outdoors.',
            meta: `Feels like ${formatTemperatureValue(current.apparent_temperature)}`
        },
        {
            icon: 'fa-briefcase',
            name: 'Commute & Errands',
            suitability: commuteSuitability,
            badge: commuteSuitability === 'great' ? 'Smooth' : commuteSuitability === 'good' ? 'Manageable' : commuteSuitability === 'caution' ? 'Plan Ahead' : 'Expect Delays',
            reason: condition.includes('storm')
                ? 'Storm conditions may slow travel. Add buffer time and prioritize safety over speed.'
                : windSpeed > 25
                    ? 'Windy conditions can make commuting less comfortable, especially on bikes or open routes.'
                    : 'Errands and travel look fairly manageable with the current setup.',
            meta: `Wind: ${formatWindSpeed(windSpeed)}`
        },
        {
            icon: 'fa-bed',
            name: 'Recovery Plan',
            suitability: recoverySuitability,
            badge: recoverySuitability === 'indoor' ? 'Recovery First' : recoverySuitability === 'caution' ? 'Warm Up Well' : 'Balanced Day',
            reason: recoverySuitability === 'indoor'
                ? 'Use shade, rest, hydration, and indoor time to reduce body strain today.'
                : recoverySuitability === 'caution'
                    ? 'Start slowly, keep warm, and use layers before longer activity.'
                    : 'Conditions support a balanced day with movement, hydration, and normal recovery habits.',
            meta: `Rain risk: ${rainChance}%`
        }
    ];

    container.innerHTML = `
        <h3 class="section-title"><i class="fas fa-calendar-check"></i> Weather-based Activity Planner</h3>
        <div class="activity-suggestions">
            ${activities.map(activity => `
                <article class="activity ${activity.suitability}">
                    <div class="activity-header">
                        <div class="activity-icon"><i class="fas ${activity.icon}"></i></div>
                        <div>
                            <strong>${escapeHtml(activity.name)}</strong>
                            <span class="activity-badge">${escapeHtml(activity.badge)}</span>
                        </div>
                    </div>
                    <p class="activity-note">${escapeHtml(activity.reason)}</p>
                    <div class="activity-meta">${escapeHtml(activity.meta)}</div>
                </article>
            `).join('')}
        </div>
    `;
}

const challengeStorageKey = 'weatherChallengeState';
const challengeQuizBank = [
    {
        id: 'clouds-1',
        question: 'What do cumulonimbus clouds usually indicate?',
        options: ['Thunderstorms', 'Clear skies', 'Dry heat', 'Light fog'],
        correct: 0,
        explanation: 'Cumulonimbus clouds are towering storm clouds commonly linked to thunderstorms.'
    },
    {
        id: 'wind-1',
        question: 'Which instrument is used to measure wind speed?',
        options: ['Barometer', 'Anemometer', 'Hygrometer', 'Thermometer'],
        correct: 1,
        explanation: 'An anemometer measures wind speed and is a core weather station instrument.'
    },
    {
        id: 'pressure-1',
        question: 'A falling air pressure reading often signals what?',
        options: ['Approaching unstable weather', 'Guaranteed sunshine', 'Lower humidity only', 'A colder ocean current'],
        correct: 0,
        explanation: 'Dropping air pressure often points to unsettled or stormy weather moving in.'
    },
    {
        id: 'temperature-1',
        question: 'What does “feels like” temperature represent?',
        options: ['The overnight low', 'How the body perceives temperature', 'Only the ground temperature', 'The sea surface temperature'],
        correct: 1,
        explanation: 'Feels-like temperature accounts for factors like humidity and wind to reflect human comfort.'
    },
    {
        id: 'aqi-1',
        question: 'What does a lower AQI value generally mean?',
        options: ['Poorer air quality', 'Better air quality', 'Stronger winds', 'Higher rainfall'],
        correct: 1,
        explanation: 'Lower AQI values usually indicate cleaner air and lower pollution risk.'
    },
    {
        id: 'forecast-1',
        question: 'Which forecast is usually most reliable?',
        options: ['The next 24 hours', 'The next 30 days', 'The next 6 months', 'The next year'],
        correct: 0,
        explanation: 'Short-range forecasts, especially within 24 hours, are typically the most accurate.'
    }
];

const challengeDefinitions = [
    {
        id: 'sun_seeker',
        title: 'Sun Seeker',
        description: 'Check 3 bright or clear forecasts.',
        icon: 'fa-sun',
        target: 3,
        getProgress: state => state.weatherCounts.sunny
    },
    {
        id: 'rain_warrior',
        title: 'Rain Warrior',
        description: 'Track 3 rainy or drizzly forecasts.',
        icon: 'fa-umbrella',
        target: 3,
        getProgress: state => state.weatherCounts.rainy
    },
    {
        id: 'wind_rider',
        title: 'Wind Rider',
        description: 'Check 3 windy conditions above 20 km/h.',
        icon: 'fa-wind',
        target: 3,
        getProgress: state => state.weatherCounts.windy
    },
    {
        id: 'temperature_master',
        title: 'Forecast Tracker',
        description: 'Log 10 unique forecast check-ins.',
        icon: 'fa-thermometer-full',
        target: 10,
        getProgress: state => state.weatherCounts.total
    },
    {
        id: 'storm_chaser',
        title: 'Storm Chaser',
        description: 'Spot 2 thunderstorm forecasts.',
        icon: 'fa-bolt',
        target: 2,
        getProgress: state => state.weatherCounts.storm
    },
    {
        id: 'weather_expert',
        title: 'Weather Expert',
        description: 'Explore 5 sections, save a city, and answer a quiz.',
        icon: 'fa-graduation-cap',
        target: 7,
        getProgress: state => {
            const savedCityBonus = savedLocations.length > 0 ? 1 : 0;
            const quizBonus = state.quiz.totalAnswered > 0 ? 1 : 0;
            return state.featuresVisited.length + savedCityBonus + quizBonus;
        }
    }
];

function createDefaultChallengeState() {
    return {
        weatherCounts: {
            sunny: 0,
            rainy: 0,
            windy: 0,
            storm: 0,
            total: 0
        },
        trackedWeatherKeys: [],
        featuresVisited: [],
        unlockedAchievementIds: [],
        quiz: {
            activeQuestionId: challengeQuizBank[0].id,
            answeredIds: [],
            totalAnswered: 0,
            correctAnswers: 0,
            lastResultType: '',
            lastFeedback: '',
            lastQuestionPrompt: ''
        }
    };
}

function loadChallengeState() {
    const defaultState = createDefaultChallengeState();

    try {
        const parsedState = JSON.parse(localStorage.getItem(challengeStorageKey));
        if (!parsedState) return defaultState;

        return {
            ...defaultState,
            weatherCounts: {
                ...defaultState.weatherCounts,
                ...(parsedState.weatherCounts || {})
            },
            trackedWeatherKeys: Array.isArray(parsedState.trackedWeatherKeys)
                ? parsedState.trackedWeatherKeys.slice(-60)
                : [],
            featuresVisited: Array.isArray(parsedState.featuresVisited)
                ? [...new Set(parsedState.featuresVisited)]
                : [],
            unlockedAchievementIds: Array.isArray(parsedState.unlockedAchievementIds)
                ? [...new Set(parsedState.unlockedAchievementIds)]
                : [],
            quiz: {
                ...defaultState.quiz,
                ...(parsedState.quiz || {}),
                answeredIds: Array.isArray(parsedState.quiz?.answeredIds)
                    ? [...new Set(parsedState.quiz.answeredIds)]
                    : []
            }
        };
    } catch (error) {
        return defaultState;
    }
}

let challengeState = loadChallengeState();

function persistChallengeState() {
    localStorage.setItem(challengeStorageKey, JSON.stringify(challengeState));
}

function getAchievementProgress(achievement) {
    return Math.min(achievement.target, achievement.getProgress(challengeState));
}

function isAchievementUnlocked(achievement) {
    return challengeState.unlockedAchievementIds.includes(achievement.id)
        || achievement.getProgress(challengeState) >= achievement.target;
}

function calculateChallengeScore() {
    const unlockedCount = challengeState.unlockedAchievementIds.length;
    return (challengeState.weatherCounts.total * 10)
        + (challengeState.quiz.correctAnswers * 25)
        + (unlockedCount * 50);
}

function renderChallengeOverview() {
    const container = document.getElementById('challenge-overview');
    if (!container) return;

    const completedCount = challengeDefinitions.filter(isAchievementUnlocked).length;
    const quizAccuracy = challengeState.quiz.totalAnswered
        ? Math.round((challengeState.quiz.correctAnswers / challengeState.quiz.totalAnswered) * 100)
        : 0;

    container.innerHTML = `
        <div class="challenge-stat">
            <span class="challenge-stat-label">Explorer Score</span>
            <strong class="challenge-stat-value">${calculateChallengeScore()}</strong>
            <span class="challenge-stat-meta">Earned from forecasts, quiz wins, and badges</span>
        </div>
        <div class="challenge-stat">
            <span class="challenge-stat-label">Achievements Unlocked</span>
            <strong class="challenge-stat-value">${completedCount}/${challengeDefinitions.length}</strong>
            <span class="challenge-stat-meta">Keep exploring to complete the full board</span>
        </div>
        <div class="challenge-stat">
            <span class="challenge-stat-label">Quiz Accuracy</span>
            <strong class="challenge-stat-value">${quizAccuracy}%</strong>
            <span class="challenge-stat-meta">${challengeState.quiz.correctAnswers} correct out of ${challengeState.quiz.totalAnswered || 0}</span>
        </div>
        <div class="challenge-stat">
            <span class="challenge-stat-label">Forecast Check-ins</span>
            <strong class="challenge-stat-value">${challengeState.weatherCounts.total}</strong>
            <span class="challenge-stat-meta">Unique weather snapshots logged</span>
        </div>
    `;
}

function evaluateChallengeAchievements(notify = false) {
    const newlyUnlocked = [];

    challengeDefinitions.forEach(achievement => {
        if (
            achievement.getProgress(challengeState) >= achievement.target
            && !challengeState.unlockedAchievementIds.includes(achievement.id)
        ) {
            challengeState.unlockedAchievementIds.push(achievement.id);
            newlyUnlocked.push(achievement);
        }
    });

    if (notify) {
        newlyUnlocked.forEach(achievement => {
            showNotification(`Achievement unlocked: ${achievement.title}`, 'success');
        });
    }
}

function refreshChallengeSection(notify = false) {
    evaluateChallengeAchievements(notify);
    persistChallengeState();
    renderChallengeOverview();
    loadAchievements();
    loadWeatherQuiz();
}

function trackFeatureVisit(feature) {
    if (!feature || challengeState.featuresVisited.includes(feature)) return;

    challengeState.featuresVisited.push(feature);
    refreshChallengeSection(true);
}

function trackChallengeWeatherProgress(data) {
    if (!data || !data.location || !data.current) return;

    const dayKey = new Date().toISOString().split('T')[0];
    const weatherKey = `${dayKey}-${createLocationId(data.location.name, data.location.country || '')}-${data.current.weather_code}`;

    if (challengeState.trackedWeatherKeys.includes(weatherKey)) return;

    challengeState.trackedWeatherKeys.push(weatherKey);
    challengeState.trackedWeatherKeys = challengeState.trackedWeatherKeys.slice(-60);
    challengeState.weatherCounts.total += 1;

    const weatherCode = data.current.weather_code;
    const description = getWeatherDescription(weatherCode).toLowerCase();

    if ([0, 1, 2].includes(weatherCode)) {
        challengeState.weatherCounts.sunny += 1;
    }

    if (description.includes('rain') || description.includes('drizzle') || description.includes('shower')) {
        challengeState.weatherCounts.rainy += 1;
    }

    if (data.current.wind_speed_10m >= 20) {
        challengeState.weatherCounts.windy += 1;
    }

    if (description.includes('thunderstorm')) {
        challengeState.weatherCounts.storm += 1;
    }

    refreshChallengeSection(true);
}

function loadAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    grid.innerHTML = challengeDefinitions.map(achievement => {
        const progress = getAchievementProgress(achievement);
        const unlocked = isAchievementUnlocked(achievement);
        const progressPercent = Math.round((progress / achievement.target) * 100);

        return `
            <article class="achievement ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-header">
                    <div class="achievement-icon">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <span class="achievement-badge">${unlocked ? 'Unlocked' : 'In Progress'}</span>
                </div>
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-meta">${progress}/${achievement.target}</div>
                </div>
            </article>
        `;
    }).join('');
}

function getCurrentQuizQuestion() {
    const unansweredQuestions = challengeQuizBank.filter(
        question => !challengeState.quiz.answeredIds.includes(question.id)
    );

    if (!unansweredQuestions.length) {
        challengeState.quiz.activeQuestionId = '';
        return null;
    }

    const activeQuestion = unansweredQuestions.find(
        question => question.id === challengeState.quiz.activeQuestionId
    ) || unansweredQuestions[0];

    challengeState.quiz.activeQuestionId = activeQuestion.id;
    return activeQuestion;
}

function answerWeatherQuiz(questionId, selectedIndex) {
    if (challengeState.quiz.answeredIds.includes(questionId)) return;

    const question = challengeQuizBank.find(item => item.id === questionId);
    if (!question) return;

    const isCorrect = selectedIndex === question.correct;

    challengeState.quiz.answeredIds.push(questionId);
    challengeState.quiz.totalAnswered += 1;
    challengeState.quiz.lastQuestionPrompt = question.question;
    challengeState.quiz.lastResultType = isCorrect ? 'success' : 'error';
    challengeState.quiz.lastFeedback = isCorrect
        ? `Correct. ${question.explanation}`
        : `Not quite. ${question.explanation}`;

    if (isCorrect) {
        challengeState.quiz.correctAnswers += 1;
    }

    const nextQuestion = challengeQuizBank.find(
        item => !challengeState.quiz.answeredIds.includes(item.id)
    );
    challengeState.quiz.activeQuestionId = nextQuestion ? nextQuestion.id : '';

    refreshChallengeSection(true);
    showNotification(
        isCorrect ? 'Correct answer! Challenge progress updated.' : 'Incorrect answer. Check the explanation and keep going.',
        isCorrect ? 'success' : 'error'
    );
}

function resetWeatherQuizProgress() {
    challengeState.quiz = createDefaultChallengeState().quiz;
    refreshChallengeSection();
}

function loadWeatherQuiz() {
    const container = document.getElementById('weather-quiz');
    if (!container) return;

    const currentQuestion = getCurrentQuizQuestion();
    const answeredCount = challengeState.quiz.totalAnswered;
    const totalQuestions = challengeQuizBank.length;
    const feedbackClass = challengeState.quiz.lastResultType || 'info';
    const feedbackTitle = challengeState.quiz.lastResultType === 'success' ? 'Last answer' : 'Review';

    if (!currentQuestion) {
        const accuracy = totalQuestions
            ? Math.round((challengeState.quiz.correctAnswers / totalQuestions) * 100)
            : 0;

        container.innerHTML = `
            <div class="quiz-card">
                <div class="quiz-chip">Challenge Complete</div>
                <h4 class="quiz-question">You finished the weather quiz set.</h4>
                <div class="quiz-scoreboard">
                    <div class="quiz-score-item">
                        <strong>${challengeState.quiz.correctAnswers}/${totalQuestions}</strong>
                        <span>Correct Answers</span>
                    </div>
                    <div class="quiz-score-item">
                        <strong>${accuracy}%</strong>
                        <span>Accuracy</span>
                    </div>
                </div>
                ${challengeState.quiz.lastFeedback ? `
                    <div class="quiz-feedback ${feedbackClass}">
                        <strong>${feedbackTitle}:</strong> ${escapeHtml(challengeState.quiz.lastFeedback)}
                    </div>
                ` : ''}
                <div class="quiz-actions">
                    <button type="button" class="export-btn" id="restart-weather-quiz">
                        <i class="fas fa-rotate-right"></i> Restart Quiz
                    </button>
                </div>
            </div>
        `;

        const restartButton = document.getElementById('restart-weather-quiz');
        if (restartButton) {
            restartButton.addEventListener('click', resetWeatherQuizProgress);
        }
        return;
    }

    container.innerHTML = `
        <div class="quiz-card">
            <div class="quiz-topbar">
                <span class="quiz-chip">Question ${answeredCount + 1} of ${totalQuestions}</span>
                <span class="quiz-score">Score: ${challengeState.quiz.correctAnswers}/${totalQuestions}</span>
            </div>
            ${challengeState.quiz.lastFeedback ? `
                <div class="quiz-feedback ${feedbackClass}">
                    <strong>${feedbackTitle}:</strong> ${escapeHtml(challengeState.quiz.lastFeedback)}
                </div>
            ` : ''}
            <h4 class="quiz-question">${escapeHtml(currentQuestion.question)}</h4>
            <div class="quiz-options">
                ${currentQuestion.options.map((option, index) => `
                    <button type="button" class="quiz-option" data-quiz-question="${currentQuestion.id}" data-quiz-option="${index}">
                        ${escapeHtml(option)}
                    </button>
                `).join('')}
            </div>
            <div class="quiz-actions">
                <button type="button" class="export-btn" id="restart-weather-quiz">
                    <i class="fas fa-rotate-right"></i> Reset Progress
                </button>
            </div>
        </div>
    `;

    container.querySelectorAll('[data-quiz-option]').forEach(button => {
        button.addEventListener('click', () => {
            answerWeatherQuiz(
                button.getAttribute('data-quiz-question'),
                Number(button.getAttribute('data-quiz-option'))
            );
        });
    });

    const restartButton = document.getElementById('restart-weather-quiz');
    if (restartButton) {
        restartButton.addEventListener('click', resetWeatherQuizProgress);
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
    if (!emergencyMode) return;
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
    const emergencyMode = document.getElementById('emergency-mode');
    if (emergencyMode) {
        emergencyMode.classList.remove('active');
    }
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
    if (!container) return;
    const episodes = [
        {
            title: "Understanding Hurricanes",
            description: "A NOAA overview of how hurricanes develop, strengthen, and affect communities.",
            duration: "4 min",
            provider: "NOAA Ocean Today",
            embedUrl: "https://www.youtube.com/embed/TYbaiwU6H0M",
            sourceUrl: "https://oceantoday.noaa.gov/hurricanes101/"
        },
        {
            title: "Cloud Types Explained",
            description: "Learn how different cloud families form and what they can tell you about incoming weather.",
            duration: "4 min",
            provider: "NOAA SciJinks",
            embedUrl: "https://www.youtube.com/embed/GOEw8T4gTjE",
            sourceUrl: "https://scijinks.gov/clouds/"
        },
        {
            title: "Climate Change Basics",
            description: "NASA explains what decades of Earth observations reveal about climate change and our planet.",
            duration: "4 min",
            provider: "NASA Science",
            embedUrl: "https://www.youtube.com/embed/Q-Zsu1__tPU",
            sourceUrl: "https://science.nasa.gov/resource/video-what-nasa-knows-from-decades-of-earth-system-observations/"
        }
    ];

    container.innerHTML = episodes.map(episode => `
        <div class="episode">
            <div class="episode-video">
                <iframe
                    src="${episode.embedUrl}"
                    title="${episode.title}"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            </div>
            <div class="episode-content">
                <div class="episode-meta">
                    <span class="episode-provider">${episode.provider}</span>
                    <span class="episode-duration">${episode.duration}</span>
                </div>
                <h4>${episode.title}</h4>
                <p>${episode.description}</p>
                <a class="export-btn episode-link" href="${episode.sourceUrl}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-arrow-up-right-from-square"></i> Open Source
                </a>
            </div>
        </div>
    `).join('');
}

function formatDurationHours(seconds) {
    if (typeof seconds !== 'number') return '--';
    return `${(seconds / 3600).toFixed(1)}h`;
}

function getAnalyticsPressureTrend(hourly) {
    if (!hourly?.pressure_msl?.length) {
        return { label: 'Unavailable', detail: 'Pressure trend data not ready yet.' };
    }

    const firstPressure = hourly.pressure_msl[0];
    const laterPressure = hourly.pressure_msl[Math.min(5, hourly.pressure_msl.length - 1)];
    const delta = laterPressure - firstPressure;

    if (delta > 1.5) {
        return { label: 'Rising', detail: 'Conditions may settle as pressure climbs.' };
    }

    if (delta < -1.5) {
        return { label: 'Falling', detail: 'Watch for more unsettled weather ahead.' };
    }

    return { label: 'Steady', detail: 'No major pressure swings in the short term.' };
}

function getAnalyticsBestWindow(hourly) {
    if (!hourly?.time?.length) {
        return { label: 'Unavailable', detail: 'Hourly data not available yet.' };
    }

    const currentIndex = Math.max(
        0,
        hourly.time.findIndex(time => new Date(time) >= new Date())
    );

    let bestWindow = {
        label: 'Unavailable',
        score: 0,
        detail: 'Not enough hourly data yet.'
    };

    for (let i = currentIndex; i < Math.min(currentIndex + 12, hourly.time.length); i++) {
        const precipChance = hourly.precipitation_probability?.[i] ?? 0;
        const humidity = hourly.relative_humidity_2m?.[i] ?? 50;
        const windSpeed = hourly.wind_speed_10m?.[i] ?? 0;
        const temperature = hourly.temperature_2m?.[i] ?? 22;
        const comfortPenalty = Math.abs(temperature - 22) * 2;
        const score = Math.max(0, Math.round(100 - precipChance - comfortPenalty - (windSpeed * 1.5) - Math.abs(humidity - 55) * 0.4));

        if (score > bestWindow.score) {
            bestWindow = {
                label: new Date(hourly.time[i]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                score,
                detail: `${precipChance}% rain chance and ${formatWindSpeed(windSpeed)} winds`
            };
        }
    }

    return bestWindow;
}

function getAnalyticsAirQualitySummary() {
    const aqi = currentAirQualityData?.current?.european_aqi;
    if (typeof aqi !== 'number') {
        return {
            value: 'Loading',
            detail: 'Air quality analytics will update after AQI data loads.'
        };
    }

    if (aqi <= 20) {
        return { value: 'Excellent', detail: `AQI ${Math.round(aqi)} with low pollution risk.` };
    }

    if (aqi <= 40) {
        return { value: 'Fair', detail: `AQI ${Math.round(aqi)} and generally acceptable outdoor air.` };
    }

    if (aqi <= 60) {
        return { value: 'Moderate', detail: `AQI ${Math.round(aqi)} and some sensitivity risk outdoors.` };
    }

    return { value: 'Poor', detail: `AQI ${Math.round(aqi)} and greater pollution exposure risk.` };
}

function renderAnalyticsTrendChart(weatherData) {
    const canvas = document.getElementById('analyticsTrendCanvas');
    if (!canvas || !weatherData?.hourly || typeof Chart === 'undefined') return;

    const context = canvas.getContext('2d');
    const hourly = weatherData.hourly;
    const currentIndex = Math.max(
        0,
        hourly.time.findIndex(time => new Date(time) >= new Date())
    );
    const endIndex = Math.min(currentIndex + 12, hourly.time.length);
    const labels = hourly.time.slice(currentIndex, endIndex).map(time =>
        new Date(time).toLocaleTimeString([], { hour: 'numeric', hour12: true })
    );
    const rainChance = hourly.precipitation_probability.slice(currentIndex, endIndex);
    const windSeries = hourly.wind_speed_10m.slice(currentIndex, endIndex).map(speed =>
        currentUnit === 'imperial' ? Number((speed * 0.621371).toFixed(1)) : speed
    );
    const humiditySeries = hourly.relative_humidity_2m.slice(currentIndex, endIndex);

    if (analyticsTrendChart) {
        analyticsTrendChart.destroy();
    }

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

    analyticsTrendChart = new Chart(context, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Rain Chance (%)',
                    data: rainChance,
                    borderColor: accentColor,
                    backgroundColor: 'rgba(50, 161, 206, 0.14)',
                    yAxisID: 'y',
                    fill: true,
                    tension: 0.35
                },
                {
                    label: `Wind (${currentUnit === 'metric' ? 'km/h' : 'mph'})`,
                    data: windSeries,
                    borderColor: secondaryColor,
                    backgroundColor: 'rgba(22, 96, 136, 0.18)',
                    yAxisID: 'y1',
                    tension: 0.35
                },
                {
                    label: 'Humidity (%)',
                    data: humiditySeries,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderDash: [5, 5],
                    yAxisID: 'y',
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: borderColor },
                    ticks: { color: textColor },
                    title: { display: true, text: 'Percent / Humidity', color: textColor }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: textColor },
                    title: { display: true, text: `Wind (${currentUnit === 'metric' ? 'km/h' : 'mph'})`, color: textColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: borderColor }
                }
            },
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            }
        }
    });
}

function loadAnalyticsDashboard(weatherData) {
    const container = document.getElementById('analytics-grid');
    const breakdown = document.getElementById('analytics-breakdown');
    const timeline = document.getElementById('analytics-timeline');

    if (!container || !breakdown || !timeline) return;

    if (!weatherData?.daily || !weatherData?.hourly || !weatherData?.current) {
        container.innerHTML = '<div class="analytics-empty">Analytics will appear once live weather data is loaded.</div>';
        breakdown.innerHTML = '';
        timeline.innerHTML = '';
        return;
    }

    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    const current = weatherData.current;

    const avgHigh = daily.temperature_2m_max.reduce((a, b) => a + b, 0) / daily.temperature_2m_max.length;
    const avgLow = daily.temperature_2m_min.reduce((a, b) => a + b, 0) / daily.temperature_2m_min.length;
    const maxTemp = Math.max(...daily.temperature_2m_max);
    const minTemp = Math.min(...daily.temperature_2m_min);
    const peakRainChance = Math.max(...daily.precipitation_probability_max);
    const peakRainIndex = daily.precipitation_probability_max.indexOf(peakRainChance);
    const strongestWind = Math.max(...daily.wind_speed_10m_max);
    const strongestWindIndex = daily.wind_speed_10m_max.indexOf(strongestWind);
    const comfortScore = Math.max(
        0,
        Math.round(
            100
            - Math.abs(current.apparent_temperature - 22) * 2.2
            - Math.abs(current.relative_humidity_2m - 55) * 0.5
            - Math.max(0, current.wind_speed_10m - 15) * 1.4
            - (current.precipitation || 0) * 8
        )
    );
    const tempSpread = currentUnit === 'imperial' ? (maxTemp - minTemp) * 9 / 5 : maxTemp - minTemp;
    const pressureTrend = getAnalyticsPressureTrend(hourly);
    const bestWindow = getAnalyticsBestWindow(hourly);
    const airQuality = getAnalyticsAirQualitySummary();
    const wettestDayLabel = new Date(daily.time[peakRainIndex]).toLocaleDateString('en-US', { weekday: 'short' });
    const strongestWindLabel = new Date(daily.time[strongestWindIndex]).toLocaleDateString('en-US', { weekday: 'short' });

    container.innerHTML = `
        <article class="metric-card analytics-metric-card">
            <div class="analytics-metric-icon"><i class="fas fa-person-walking"></i></div>
            <h4>Comfort Score</h4>
            <div class="metric-value">${comfortScore}</div>
            <div class="metric-detail">Current outdoor comfort profile</div>
            <div class="metric-trend">${formatTemperatureValue(current.apparent_temperature)} feels-like</div>
        </article>
        <article class="metric-card analytics-metric-card">
            <div class="analytics-metric-icon"><i class="fas fa-arrows-left-right-to-line"></i></div>
            <h4>Temperature Range</h4>
            <div class="metric-value">±${tempSpread.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}</div>
            <div class="metric-detail">Spread between forecast extremes</div>
            <div class="metric-trend">${formatTemperatureValue(avgHigh)} avg high / ${formatTemperatureValue(avgLow)} avg low</div>
        </article>
        <article class="metric-card analytics-metric-card">
            <div class="analytics-metric-icon"><i class="fas fa-cloud-rain"></i></div>
            <h4>Peak Rain Risk</h4>
            <div class="metric-value">${peakRainChance}%</div>
            <div class="metric-detail">Highest daily precipitation probability</div>
            <div class="metric-trend">${wettestDayLabel} looks like the wettest day</div>
        </article>
        <article class="metric-card analytics-metric-card">
            <div class="analytics-metric-icon"><i class="fas fa-wind"></i></div>
            <h4>Strongest Wind</h4>
            <div class="metric-value">${formatWindSpeed(strongestWind)}</div>
            <div class="metric-detail">Strongest daily wind maximum ahead</div>
            <div class="metric-trend">${strongestWindLabel} has the sharpest wind setup</div>
        </article>
        <article class="metric-card analytics-metric-card">
            <div class="analytics-metric-icon"><i class="fas fa-gauge-high"></i></div>
            <h4>Pressure Trend</h4>
            <div class="metric-value">${pressureTrend.label}</div>
            <div class="metric-detail">${pressureTrend.detail}</div>
            <div class="metric-trend">${current.pressure_msl} hPa right now</div>
        </article>
        <article class="metric-card analytics-metric-card">
            <div class="analytics-metric-icon"><i class="fas fa-wind-warning"></i></div>
            <h4>Air Quality</h4>
            <div class="metric-value">${airQuality.value}</div>
            <div class="metric-detail">${airQuality.detail}</div>
            <div class="metric-trend">${current.relative_humidity_2m}% humidity currently</div>
        </article>
    `;

    const insightItems = [
        {
            title: 'Best outdoor window',
            value: bestWindow.label,
            detail: bestWindow.detail
        },
        {
            title: 'Sunshine today',
            value: `${formatDurationHours(daily.sunshine_duration[0])}`,
            detail: `${formatDurationHours(daily.daylight_duration[0])} of total daylight expected`
        },
        {
            title: 'Warmest forecast day',
            value: new Date(daily.time[daily.temperature_2m_max.indexOf(maxTemp)]).toLocaleDateString('en-US', { weekday: 'short' }),
            detail: `${formatTemperatureValue(maxTemp)} is the warmest projected high`
        },
        {
            title: 'Coolest overnight low',
            value: new Date(daily.time[daily.temperature_2m_min.indexOf(minTemp)]).toLocaleDateString('en-US', { weekday: 'short' }),
            detail: `${formatTemperatureValue(minTemp)} is the lowest projected temperature`
        }
    ];

    breakdown.innerHTML = insightItems.map(item => `
        <div class="analytics-breakdown-item">
            <div class="analytics-breakdown-label">${escapeHtml(item.title)}</div>
            <div class="analytics-breakdown-value">${escapeHtml(item.value)}</div>
            <div class="analytics-breakdown-detail">${escapeHtml(item.detail)}</div>
        </div>
    `).join('');

    timeline.innerHTML = daily.time.slice(0, 5).map((time, index) => `
        <article class="analytics-day-card">
            <div class="analytics-day-top">
                <strong>${new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}</strong>
                <span>${new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div class="analytics-day-temp">${formatTemperatureValue(daily.temperature_2m_max[index])} / ${formatTemperatureValue(daily.temperature_2m_min[index])}</div>
            <div class="analytics-day-meta">${escapeHtml(getWeatherDescription(daily.weather_code[index]))}</div>
            <div class="analytics-day-meta">Rain risk: ${daily.precipitation_probability_max[index]}%</div>
            <div class="analytics-day-meta">Wind max: ${formatWindSpeed(daily.wind_speed_10m_max[index])}</div>
        </article>
    `).join('');

    renderAnalyticsTrendChart(weatherData);
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
        loadAnalyticsDashboard(currentWeatherData);
    }

    renderComparisonChart(latestComparisonResults);
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
document.addEventListener('DOMContentLoaded', initTheme);

prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        if (currentWeatherData) {
            renderWeatherCharts(currentWeatherData);
            loadAnalyticsDashboard(currentWeatherData);
        }
        renderComparisonChart(latestComparisonResults);
    }
});

const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const HISTORICAL_WEATHER_URL = 'https://archive-api.open-meteo.com/v1/archive';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const voiceSearchBtn = document.getElementById('voice-search-btn');
const searchSuggestions = document.getElementById('search-suggestions');
const compareCityInput = document.getElementById('compare-city-input');
const compareAddBtn = document.getElementById('compare-add-btn');
const compareCurrentBtn = document.getElementById('compare-current-btn');
const clearComparisonBtn = document.getElementById('clear-comparison-btn');
const mainContent = document.getElementById('main-content');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const exportPdfBtn = document.getElementById('export-pdf');
const shareWeatherBtn = document.getElementById('share-weather');
const saveLocationBtn = document.getElementById('save-location');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const savedLocationsList = document.getElementById('saved-locations-list');

let currentUnit = 'metric';
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
let savedLocations = normalizeSavedLocations(JSON.parse(localStorage.getItem('savedLocations')) || []);
let currentWeatherData = null;
let weatherChart = null;
let historicalWeatherChart = null;
let analyticsTrendChart = null;
let comparisonChart = null;
let currentAirQualityData = null;
let suggestionResults = [];
let activeSuggestionIndex = -1;
let citySearchDebounceTimer = null;
let comparisonWeatherCache = {};
let latestComparisonResults = [];
let comparisonRequestToken = 0;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createLocationId(name, country = '') {
    const normalizedId = `${name}-${country}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return normalizedId || `saved-location-${Date.now()}`;
}

function normalizeSavedLocations(locations) {
    return locations
        .map(location => {
            if (!location) return null;

            if (typeof location === 'string') {
                const [namePart, ...countryParts] = location.split(',');
                const name = namePart?.trim();
                const country = countryParts.join(',').trim();

                if (!name) return null;

                return {
                    id: createLocationId(name, country),
                    name,
                    country,
                    latitude: null,
                    longitude: null,
                    temperature: null,
                    condition: '',
                    savedAt: new Date().toISOString()
                };
            }

            if (!location.name) return null;

            return {
                id: location.id || createLocationId(location.name, location.country || ''),
                name: location.name,
                country: location.country || '',
                latitude: typeof location.latitude === 'number' ? location.latitude : null,
                longitude: typeof location.longitude === 'number' ? location.longitude : null,
                temperature: typeof location.temperature === 'number' ? location.temperature : null,
                condition: location.condition || '',
                savedAt: location.savedAt || new Date().toISOString()
            };
        })
        .filter(Boolean);
}

function getLocationLabel(location) {
    return `${location.name}${location.country ? ', ' + location.country : ''}`;
}

function persistSavedLocations() {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
}

function formatTemperatureValue(metricTemp) {
    let temp = metricTemp;
    if (currentUnit === 'imperial') {
        temp = (temp * 9 / 5) + 32;
    }

    return `${Math.round(temp)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
}

function formatWindSpeed(metricWindSpeed) {
    if (currentUnit === 'imperial') {
        return `${(metricWindSpeed * 0.621371).toFixed(1)} mph`;
    }

    return `${metricWindSpeed} km/h`;
}

function updateShareableCityLink(location) {
    if (!location || !location.name) return;

    const url = new URL(window.location.href);
    url.searchParams.set('city', getLocationLabel(location));
    window.history.replaceState({}, '', url);
}

function syncSavedLocationSnapshot(weatherData) {
    if (!weatherData || !weatherData.location || !weatherData.current) return;

    const locationId = createLocationId(weatherData.location.name, weatherData.location.country || '');
    const savedLocation = savedLocations.find(location => location.id === locationId);

    if (!savedLocation) return;

    savedLocation.latitude = weatherData.location.latitude ?? savedLocation.latitude;
    savedLocation.longitude = weatherData.location.longitude ?? savedLocation.longitude;
    savedLocation.temperature = weatherData.current.temperature_2m;
    savedLocation.condition = getWeatherDescription(weatherData.current.weather_code);

    persistSavedLocations();
    renderSavedLocations();
}

function renderSavedLocations() {
    if (!savedLocationsList) return;

    if (!savedLocations.length) {
        savedLocationsList.innerHTML = `
            <div class="saved-location-empty">
                Save the cities that matter most to you so you can reopen them instantly during your hackathon demo or daily routine.
            </div>
        `;
        renderComparisonQuickPicks();
        return;
    }

    savedLocationsList.innerHTML = savedLocations.map(location => `
        <article class="saved-location-card">
            <div class="saved-location-top">
                <div>
                    <div class="saved-location-name">${escapeHtml(location.name)}</div>
                    <span class="saved-location-country">${escapeHtml(location.country || 'Quick access weather')}</span>
                </div>
                <div class="saved-location-temp">
                    ${location.temperature === null ? '--' : formatTemperatureValue(location.temperature)}
                </div>
            </div>
            <div class="saved-location-summary">
                ${escapeHtml(location.condition || 'Open this saved city to refresh the latest forecast and air quality.')}
            </div>
            <div class="saved-location-actions">
                <button type="button" class="saved-location-btn primary" data-open-location="${escapeHtml(location.id)}">
                    Open
                </button>
                <button type="button" class="saved-location-btn secondary" data-remove-location="${escapeHtml(location.id)}">
                    Remove
                </button>
            </div>
        </article>
    `).join('');

    savedLocationsList.querySelectorAll('[data-open-location]').forEach(button => {
        button.addEventListener('click', () => {
            openSavedLocation(button.getAttribute('data-open-location'));
        });
    });

    savedLocationsList.querySelectorAll('[data-remove-location]').forEach(button => {
        button.addEventListener('click', () => {
            removeSavedLocation(button.getAttribute('data-remove-location'));
        });
    });

    renderComparisonQuickPicks();
}

async function openSavedLocation(locationId) {
    const location = savedLocations.find(item => item.id === locationId);
    if (!location) return;

    activateFeature('weather');

    if (cityInput) {
        cityInput.value = getLocationLabel(location);
    }

    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        await loadSelectedLocation(location);
        return;
    }

    await getCoordinates(getLocationLabel(location));
}

function removeSavedLocation(locationId) {
    const location = savedLocations.find(item => item.id === locationId);
    if (!location) return;

    savedLocations = savedLocations.filter(item => item.id !== locationId);
    persistSavedLocations();
    renderSavedLocations();
    updateSavedLocationsButton();
    refreshChallengeSection();
    showNotification(`Removed ${getLocationLabel(location)} from saved locations`, 'info');
}

function hideCitySuggestions() {
    if (!searchSuggestions) return;

    searchSuggestions.innerHTML = '';
    searchSuggestions.hidden = true;
    suggestionResults = [];
    activeSuggestionIndex = -1;
}

function renderCitySuggestions(results) {
    if (!searchSuggestions) return;

    suggestionResults = results;
    activeSuggestionIndex = -1;

    if (!results.length) {
        searchSuggestions.innerHTML = '<div class="suggestion-empty">No matching cities found yet. Try a different spelling.</div>';
        searchSuggestions.hidden = false;
        return;
    }

    searchSuggestions.innerHTML = results.map((result, index) => `
        <button type="button" class="suggestion-item" data-suggestion-index="${index}">
            <span>
                <span class="suggestion-title">${escapeHtml(result.name)}</span>
                <span class="suggestion-meta">${escapeHtml(result.admin1 || result.country || 'Suggested location')}</span>
            </span>
            <i class="fas fa-location-dot"></i>
        </button>
    `).join('');

    searchSuggestions.hidden = false;

    searchSuggestions.querySelectorAll('[data-suggestion-index]').forEach(button => {
        button.addEventListener('mousedown', async e => {
            e.preventDefault();
            await selectSuggestedCity(Number(button.getAttribute('data-suggestion-index')));
        });
    });
}

async function fetchCitySuggestions(query) {
    if (!cityInput) return;

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
        hideCitySuggestions();
        return;
    }

    try {
        const response = await fetch(`${GEO_BASE_URL}?name=${encodeURIComponent(trimmedQuery)}&count=6&language=en&format=json`);
        if (!response.ok) throw new Error('Suggestions unavailable');

        const data = await response.json();
        if (cityInput.value.trim() !== trimmedQuery) return;

        renderCitySuggestions(data.results || []);
    } catch (error) {
        hideCitySuggestions();
    }
}

function handleCityInputChange() {
    if (!cityInput) return;

    clearTimeout(citySearchDebounceTimer);
    const query = cityInput.value.trim();

    if (query.length < 2) {
        hideCitySuggestions();
        return;
    }

    citySearchDebounceTimer = setTimeout(() => {
        fetchCitySuggestions(query);
    }, 250);
}

function handleCityInputKeydown(e) {
    if (e.key === 'Escape') {
        hideCitySuggestions();
        return;
    }

    const suggestionsOpen = searchSuggestions && !searchSuggestions.hidden && suggestionResults.length > 0;

    if (suggestionsOpen && e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestionResults.length;
    } else if (suggestionsOpen && e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestionResults.length) % suggestionResults.length;
    } else if (suggestionsOpen && e.key === 'Enter' && activeSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestedCity(activeSuggestionIndex);
        return;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
        return;
    } else {
        return;
    }

    searchSuggestions.querySelectorAll('[data-suggestion-index]').forEach(button => {
        const buttonIndex = Number(button.getAttribute('data-suggestion-index'));
        button.classList.toggle('active', buttonIndex === activeSuggestionIndex);
    });
}

async function selectSuggestedCity(index) {
    const selectedCity = suggestionResults[index];
    if (!selectedCity) return;

    await loadSelectedLocation(selectedCity);
}

async function loadSelectedLocation(locationData) {
    const normalizedLocation = {
        name: locationData.name,
        country: locationData.country || '',
        latitude: locationData.latitude,
        longitude: locationData.longitude
    };

    currentWeatherData = { location: normalizedLocation };

    if (cityInput) {
        cityInput.value = getLocationLabel(normalizedLocation);
    }

    hideCitySuggestions();
    await getWeather(normalizedLocation.latitude, normalizedLocation.longitude);
    addToRecentSearches(normalizedLocation.name, normalizedLocation.country);
    localStorage.setItem('lastCity', getLocationLabel(normalizedLocation));
}

async function fetchComparisonWeather(city) {
    const location = normalizeComparedLocation(city);
    const cacheKey = location?.id || String(city).trim().toLowerCase();
    const cachedResult = comparisonWeatherCache[cacheKey];

    if (cachedResult && (Date.now() - cachedResult.fetchedAt) < 15 * 60 * 1000) {
        return cachedResult;
    }

    let resolvedLocation = location;

    if (
        !resolvedLocation
        || typeof resolvedLocation.latitude !== 'number'
        || typeof resolvedLocation.longitude !== 'number'
    ) {
        const searchQuery = resolvedLocation?.query || getLocationLabel(resolvedLocation || { name: String(city).trim(), country: '' });
        const geoResponse = await fetch(`${GEO_BASE_URL}?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
        if (!geoResponse.ok) {
            throw new Error('Unable to find this city');
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Unable to find this city');
        }

        const geoResult = geoData.results[0];
        resolvedLocation = normalizeComparedLocation({
            ...(resolvedLocation || {}),
            name: geoResult.name,
            country: geoResult.country || resolvedLocation?.country || '',
            latitude: geoResult.latitude,
            longitude: geoResult.longitude,
            query: `${geoResult.name}${geoResult.country ? `, ${geoResult.country}` : ''}`
        });
    }

    const weatherResponse = await fetch(
        `${WEATHER_BASE_URL}?latitude=${resolvedLocation.latitude}&longitude=${resolvedLocation.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    );

    if (!weatherResponse.ok) {
        throw new Error('Weather unavailable');
    }

    const weatherData = await weatherResponse.json();
    const comparisonData = {
        fetchedAt: Date.now(),
        name: resolvedLocation.name,
        country: resolvedLocation.country,
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        weatherCode: weatherData.current.weather_code,
        isDay: weatherData.current.is_day,
        windSpeed: weatherData.current.wind_speed_10m,
        rainChance: weatherData.daily.precipitation_probability_max?.[0] || 0,
        highTemp: weatherData.daily.temperature_2m_max?.[0] ?? weatherData.current.temperature_2m,
        lowTemp: weatherData.daily.temperature_2m_min?.[0] ?? weatherData.current.temperature_2m
    };

    comparisonWeatherCache[cacheKey] = comparisonData;
    return comparisonData;
}

document.addEventListener('DOMContentLoaded', function () {
    updateDateTime();
    setInterval(updateDateTime, 60000);

    updateFooterTimestamp();
    setInterval(updateFooterTimestamp, 1000);

    persistSavedLocations();

    const initialCity = new URLSearchParams(window.location.search).get('city')
        || localStorage.getItem('lastCity')
        || 'New York';
    getCoordinates(initialCity);

    renderRecentSearches();
    renderSavedLocations();
    updateSavedLocationsButton();

    refreshChallengeSection();
    trackFeatureVisit('weather');
    updateComparisonGrid();
    loadWeatherEducation();
    updateOnlineStatus();

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (locationBtn) {
        locationBtn.addEventListener('click', handleLocation);
    }

    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', handleVoiceSearch);
    }

    if (cityInput) {
        cityInput.addEventListener('input', handleCityInputChange);
        cityInput.addEventListener('keydown', handleCityInputKeydown);
        cityInput.addEventListener('blur', () => {
            setTimeout(hideCitySuggestions, 120);
        });
    }

    if (compareCityInput) {
        compareCityInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCityToCompare();
            }
        });
    }

    if (compareAddBtn) {
        compareAddBtn.addEventListener('click', () => addCityToCompare());
    }

    if (compareCurrentBtn) {
        compareCurrentBtn.addEventListener('click', addCurrentCityToCompare);
    }

    if (clearComparisonBtn) {
        clearComparisonBtn.addEventListener('click', clearComparisonBoard);
    }

    if (celsiusBtn) {
        celsiusBtn.addEventListener('click', () => switchUnit('metric'));
    }

    if (fahrenheitBtn) {
        fahrenheitBtn.addEventListener('click', () => switchUnit('imperial'));
    }

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportAsPDF);
    }

    if (shareWeatherBtn) {
        shareWeatherBtn.addEventListener('click', shareWeather);
    }

    if (saveLocationBtn) {
        saveLocationBtn.addEventListener('click', saveCurrentLocation);
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearRecentSearches);
    }

    document.addEventListener('click', e => {
        if (!e.target.closest?.('.search-box')) {
            hideCitySuggestions();
        }
    });

    const hourlyContainer = document.getElementById('hourly-forecast');
    if (hourlyContainer) {
        hourlyContainer.setAttribute('tabindex', '0');
        hourlyContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                hourlyContainer.scrollLeft -= 100;
            } else if (e.key === 'ArrowRight') {
                hourlyContainer.scrollLeft += 100;
            }
        });
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    } else {
        if (voiceSearchBtn) {
            voiceSearchBtn.style.display = 'none';
        }
    }

    setInterval(checkEmergencyAlerts, 5 * 60 * 1000);
    checkEmergencyAlerts();

    updateAllText();
});

function updateDateTime() {
    const dateTimeElement = document.getElementById('current-date-time');
    if (dateTimeElement) {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function updateFooterTimestamp() {
    const timestampElement = document.getElementById('footer-timestamp');
    if (timestampElement) {
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
        timestampElement.textContent = `Last updated: ${timestamp}`;
    }
}

function handleSearch() {
    if (cityInput.value.trim()) {
        getCoordinates(cityInput.value.trim());
        hideCitySuggestions();
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

    if (voiceSearchBtn) {
        voiceSearchBtn.classList.add('listening');
    }
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        cityInput.value = transcript;
        getCoordinates(transcript);
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.remove('listening');
        }
    };

    recognition.onerror = (event) => {
        showError('Voice recognition error: ' + event.error);
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.remove('listening');
        }
    };

    recognition.onend = () => {
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.remove('listening');
        }
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

        await loadSelectedLocation(data.results[0]);
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
        currentAirQualityData = null;

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
        loadAnalyticsDashboard(data);
        fetchHistoricalData(lat, lon);
        updateShareableCityLink(data.location);
        localStorage.setItem('lastCity', getLocationLabel(data.location));
        syncSavedLocationSnapshot(data);
        trackChallengeWeatherProgress(data);

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
    updateSavedLocationsButton();
    renderComparisonQuickPicks();
}

function updateForecast(data) {
    const forecastDaysContainer = document.getElementById('forecast-days');
    if (!forecastDaysContainer) return;
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
    if (!hourlyContainer) return;
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
    if (!alertsContainer) return;
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
            alertsContainer.innerHTML = alertHTML;
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
    const ctx = document.getElementById('weatherChartCanvas');
    if (!ctx) return;
    const context = ctx.getContext('2d');
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

    weatherChart = new Chart(context, {
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
    const ctx = document.getElementById('historicalWeatherChartCanvas');
    if (!ctx) return;
    const context = ctx.getContext('2d');
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

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();

    historicalWeatherChart = new Chart(context, {
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
    const trendStats = document.getElementById('trend-stats');
    if (trendStats) {
        trendStats.innerHTML = `
            <div>Avg High: <span>${avgHigh.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}</span></div>
            <div>Avg Low: <span>${avgLow.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}</span></div>
            <div>Rainy Days: <span>${rainyDays}</span></div>
        `;
    }
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
    if (!background) return;
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
        currentAirQualityData = data;
        updateAirQuality(data);
        if (currentWeatherData) {
            generateHealthTips(currentWeatherData);
        }
        if (currentWeatherData) {
            loadAnalyticsDashboard(currentWeatherData);
        }
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
    const searchItem = country ? `${city}, ${country}` : city;

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
    if (!recentList) return;
    recentList.innerHTML = '';

    recentSearches.forEach(city => {
        const recentItem = document.createElement('div');
        recentItem.className = 'recent-item';
        recentItem.innerHTML = `<i class="fas fa-history"></i> ${escapeHtml(city)}`;
        recentItem.tabIndex = 0;
        recentItem.addEventListener('click', () => {
            getCoordinates(city);
        });
        recentItem.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                getCoordinates(city);
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
    const savedLocation = {
        id: createLocationId(loc.name, loc.country || ''),
        name: loc.name,
        country: loc.country || '',
        latitude: typeof loc.latitude === 'number' ? loc.latitude : null,
        longitude: typeof loc.longitude === 'number' ? loc.longitude : null,
        temperature: currentWeatherData.current?.temperature_2m ?? null,
        condition: currentWeatherData.current ? getWeatherDescription(currentWeatherData.current.weather_code) : '',
        savedAt: new Date().toISOString()
    };
    const locationString = getLocationLabel(savedLocation);

    if (!savedLocations.some(location => location.id === savedLocation.id)) {
        savedLocations.unshift(savedLocation);
        persistSavedLocations();
        renderSavedLocations();
        updateSavedLocationsButton();
        refreshChallengeSection(true);
        showNotification(`Saved ${locationString} to your locations`, 'success');
    } else {
        showNotification(`${locationString} is already saved`, 'info');
    }
}

function updateSavedLocationsButton() {
    if (!currentWeatherData || !currentWeatherData.location || !saveLocationBtn) return;

    const loc = currentWeatherData.location;
    const locationId = createLocationId(loc.name, loc.country || '');

    if (savedLocations.some(location => location.id === locationId)) {
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

    renderSavedLocations();
    updateComparisonGrid();
    if (currentWeatherData) {
        loadAnalyticsDashboard(currentWeatherData);
    }

    const currentCityElement = document.getElementById('city-name');
    if (currentCityElement && currentCityElement.textContent) {
        const currentCity = currentCityElement.textContent.trim();
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
    if (loader) loader.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

function hideLoader() {
    if (loader) loader.style.display = 'none';
}

function showMainContent() {
    if (mainContent) mainContent.style.display = 'grid';
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    if (mainContent) mainContent.style.display = 'none';
    if (loader) loader.style.display = 'none';

    setTimeout(() => {
        if (errorMessage) errorMessage.style.display = 'none';
    }, 5000);
}

function initializePreferences() {
    const savedUnit = localStorage.getItem('weatherUnit');
    if (savedUnit) {
        currentUnit = savedUnit;

        if (savedUnit === 'metric') {
            celsiusBtn.classList.add('active');
            fahrenheitBtn.classList.remove('active');
        } else {
            celsiusBtn.classList.remove('active');
            fahrenheitBtn.classList.add('active');
        }
    }
}

initializePreferences();

const serviceWorkerContent = `
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('weather-cache-v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/script.js',
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
