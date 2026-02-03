const API_URL = "https://restcountries.com/v3.1/all?fields=name,flags,region,capital,population";
const countriesDiv = document.getElementById("countries");
const pageInfo = document.getElementById("pageInfo");

let countries = [];
let currentPage = 1;
const itemsPerPage = 16;

async function fetchCountries() {
    try {
        const res = await fetch(API_URL);
        countries = await res.json();
        console.log("Fetched Countries:", countries);
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

        countriesDiv.appendChild(card);
    });

    const totalPages = Math.ceil(countries.length / itemsPerPage);
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
}

const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

if (nextBtn) {
    nextBtn.onclick = () => {
        const totalPages = Math.ceil(countries.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    };
}

if (prevBtn) {
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    };
}

fetchCountries();
