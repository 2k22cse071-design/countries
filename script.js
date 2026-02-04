const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,region,capital,population,currencies,borders,latlng";
const countriesDiv = document.getElementById("countries");
const paginationDiv = document.getElementById("pagination");


let allCountries = [];
let countries = [];
let currentPage = 1;
const itemsPerPage = 16;

async function fetchCountries() {
    try {
        const res = await fetch(API_URL);
        allCountries = await res.json();
        countries = allCountries;
        renderPage();
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
}

function renderPage() {
    countriesDiv.innerHTML = "";

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageCountries = countries.slice(start, end);

    pageCountries.forEach(c => {
        const card = document.createElement("div");
        card.className = "country-card";

        card.innerHTML = `
            <div class="flag-container">
                <img src="${c.flags.png}" alt="${c.name.common} flag" class="flag-img" loading="lazy">
            </div>
            <h4>${c.name.common}</h4>
        `;

        const img = card.querySelector(".flag-img");
        img.style.cursor = "pointer";
        img.addEventListener("click", () => openModal(c));

        countriesDiv.appendChild(card);
    });

    renderPagination();
}



function renderPagination() {
    paginationDiv.innerHTML = "";
    const totalPages = Math.ceil(countries.length / itemsPerPage);

    if (totalPages === 0) return;

    const createBtn = (text, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.className = "pagination-btn";
        if (isActive) btn.classList.add("active");
        if (isDisabled) btn.disabled = true;

        if (!isDisabled && page !== currentPage) {
            btn.onclick = () => {
                currentPage = page;
                renderPage();
            };
        }
        return btn;
    };

    paginationDiv.appendChild(createBtn("&larr; Prev", currentPage - 1, false, currentPage === 1));

    const maxVisibleButtons = 5;
    let startPage, endPage;

    if (totalPages <= maxVisibleButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage <= 3) {
            startPage = 1;
            endPage = maxVisibleButtons;
        } else if (currentPage + 2 >= totalPages) {
            startPage = totalPages - maxVisibleButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
    }

    if (startPage > 1) {
        paginationDiv.appendChild(createBtn("1", 1));
        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.innerText = "...";
            dots.className = "pagination-dots";
            paginationDiv.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationDiv.appendChild(createBtn(i, i, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement("span");
            dots.innerText = "...";
            dots.className = "pagination-dots";
            paginationDiv.appendChild(dots);
        }
        paginationDiv.appendChild(createBtn(totalPages, totalPages));
    }

    paginationDiv.appendChild(createBtn("Next &rarr;", currentPage + 1, false, currentPage === totalPages));
}


const modal = document.getElementById("countryModal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");

function openModal(country) {
    let nativeName = "N/A";
    if (country.name.nativeName) {
        const nativeKeys = Object.keys(country.name.nativeName);
        if (nativeKeys.length > 0) {
            nativeName = country.name.nativeName[nativeKeys[0]].common;
        }
    }

    let currencySymbol = "N/A";
    let currencyName = "N/A";
    if (country.currencies) {
        const currencyKeys = Object.keys(country.currencies);
        if (currencyKeys.length > 0) {
            currencySymbol = country.currencies[currencyKeys[0]].symbol || "N/A";
            currencyName = country.currencies[currencyKeys[0]].name || "N/A";
        }
    }

    let lastTwoBorders = "None";
    if (country.borders && country.borders.length > 0) {
        lastTwoBorders = country.borders.slice(-2).join(", ");
    }
    let longitude = "N/A";
    if (country.latlng && country.latlng.length >= 2) {
        longitude = country.latlng[1];
    }

    modalBody.innerHTML = `
        <img src="${country.flags.png}" alt="${country.name.common}">
        <div class="modal-detail"><strong>Native Name:</strong> ${nativeName}</div>
        <div class="modal-detail"><strong>Symbol:</strong> ${currencySymbol}</div>
        <div class="modal-detail"><strong>Currency:</strong> ${currencyName}</div>
        <div class="modal-detail"><strong>Last 2 Borders:</strong> ${lastTwoBorders}</div>
        <div class="modal-detail"><strong>Longitude:</strong> ${longitude}</div>
        <div class="modal-detail" id="weather-info"><strong>Weather:</strong> <span class="loading-text">Loading...</span></div>
    `;

    modal.style.display = "block";

    if (country.latlng && country.latlng.length >= 2) {
        fetchWeather(country.latlng[0], country.latlng[1]);
    } else {
        document.getElementById("weather-info").innerHTML = "<strong>Weather:</strong> N/A";
    }
}

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function fetchWeather(lat, lng) {
    const weatherContainer = document.getElementById("weather-info");
    try {
        const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?q=${lat},${lng}`;
        const locationRes = await fetch(locationUrl, {
            headers: {
                "Authorization": `Bearer ${WEATHER_API_KEY}`
            }
        });

        if (!locationRes.ok) throw new Error("Location API Limit/Error");
        const locationData = await locationRes.json();

        if (!locationData || !locationData.Key) throw new Error("Location not found");

        const locationKey = locationData.Key;

        const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}`;
        const weatherRes = await fetch(weatherUrl, {
            headers: {
                "Authorization": `Bearer ${WEATHER_API_KEY}`
            }
        });

        if (!weatherRes.ok) throw new Error("Weather API Limit/Error");
        const weatherData = await weatherRes.json();

        if (weatherData && weatherData.length > 0) {
            const current = weatherData[0];
            const temp = current.Temperature.Metric.Value;
            const unit = current.Temperature.Metric.Unit;
            const text = current.WeatherText;

            weatherContainer.innerHTML = `<strong>Weather:</strong> ${temp}°${unit}, ${text}`;
        } else {
            throw new Error("No weather data");
        }

    } catch (error) {
        console.error("Weather fetch error:", error);
        weatherContainer.innerHTML = `<strong>Weather:</strong> Unable to load`;
    }
}

function closeModal() {
    modal.style.display = "none";
}

if (closeBtn) {
    closeBtn.onclick = closeModal;
}

window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    countries = allCountries.filter(country =>
        country.name.common.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderPage();
});

fetchCountries();