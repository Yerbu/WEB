document.getElementById('cityDropdown').addEventListener('change', function () {
    document.getElementById('city').value = this.value;
});

function getTourImage(city) {
    switch (city) {
        case 'Astana':
            return '/images/astana.png';
        case 'London':
            return '/images/london.png';
        case 'New York':
            return '/images/new-york.png';
        case 'Tokyo':
            return '/images/tokyo.png';
        case 'Sydney':
            return '/images/sydney.png';
        default:
            return '/images/placeholder.png';
    }
}

async function showTour() {
    try {
        const city = document.getElementById('cityDropdown').value;

        console.log(`Selected City: ${city}`);


        const response = await fetch(`/getWeather?city=${city}`);
        const weatherData = await response.json();

        console.log('Weather Data:', weatherData);


        document.getElementById('weather-temperature').innerText = weatherData.main.temp.toFixed(1);


        const weatherConditions = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;
        const weatherIconUrl = `https://openweathermap.org/img/w/${weatherIcon}.png`;

        document.getElementById('weather-conditions').innerHTML = `
            <img src="${weatherIconUrl}" alt="${weatherConditions} Icon" class="weather-icon">
            ${weatherConditions}
        `;

        document.getElementById('weather-info').style.display = 'block';

        document.querySelector('.tours-container').innerHTML = '';

        const toursContainer = document.querySelector('.tours-container');
        const tourCard = document.createElement('div');
        tourCard.className = 'tour';


        const tourDates = getTourDates(city);
        const tourDuration = getTourDuration(city);
        const tourDescription = getTourDescription(city);
        const tourDetails = getTourDetails(city);
        const tourPrice = getTourPrice(city);


        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';


        textContainer.innerHTML = `
            <h3 class="tour-title">${city}</h3>
            <p class="tour-info tour-dates">Dates: ${tourDates}</p>
            <p class="tour-info tour-duration">Duration: ${tourDuration}</p>
            <p class="tour-info tour-description">Description: ${tourDescription}</p>
            <p class="tour-info tour-details">Details: ${tourDetails}</p>
            <p class="tour-info tour-price">Price: ${tourPrice}$</p>
            <button class="btn btn-success" onclick="bookTour('${city}')">Book Now</button>
        `;


        tourCard.appendChild(textContainer);


        const tourImage = document.createElement('img');
        tourImage.src = getTourImage(city);
        tourImage.alt = `${city} Image`;
        tourImage.className = 'city-image';


        tourCard.appendChild(tourImage);

        toursContainer.appendChild(tourCard);

    } catch (error) {
        console.error(error);
        alert('Error fetching information. Please try again.');
    }
}


function filterTours() {
    const showUniqueDescriptionOnly = document.getElementById('uniqueDescriptionCheckbox').checked;
    const toursContainer = document.querySelector('.tours-container');

    const uniqueTours = showUniqueDescriptionOnly
        ? Array.from(toursContainer.children).filter((tour) => {
            const description = tour.querySelector('.tour-description').innerText;
            return Array.from(toursContainer.children).filter((t) => t !== tour && t.querySelector('.tour-description').innerText === description).length === 0;
        })
        : Array.from(toursContainer.children);


    toursContainer.innerHTML = '';
    uniqueTours.forEach((tour) => toursContainer.appendChild(tour));
}


function getTourDates(city) {
    switch (city) {
        case 'Astana':
            return '18.02.2024 - 28.02.2024';
        case 'London':
            return '15.03.2024 - 30.03.2024';
        case 'New York':
            return '10.04.2024 - 24.04.2024';
        case 'Tokyo':
            return '05.05.2024 - 19.05.2024';
        case 'Sydney':
            return '01.06.2024 - 15.06.2024';
        default:
            return 'Unknown dates';
    }
}


function getTourDuration(city) {
    switch (city) {
        case 'Astana':
            return '10 days / 9 nights';
        case 'London':
            return '12 days / 11 nights';
        case 'New York':
            return '8 days / 7 nights';
        case 'Tokyo':
            return '14 days / 13 nights';
        case 'Sydney':
            return '15 days / 14 nights';
        default:
            return 'Unknown duration';
    }
}


function getTourDescription(city) {
    switch (city) {
        case 'Astana':
            return 'Experience the beauty of Kazakhstan\'s capital city.';
        case 'London':
            return 'Discover the charm of historic London.';
        case 'New York':
            return 'Explore the city that never sleeps.';
        case 'Tokyo':
            return 'Immerse yourself in the vibrant culture of Tokyo.';
        case 'Sydney':
            return 'Enjoy the stunning landscapes of Sydney and beyond.';
        default:
            return 'Unknown description';
    }
}


function getTourDetails(city) {
    switch (city) {
        case 'Astana':
            return 'Visit iconic landmarks and savor local cuisine.';
        case 'London':
            return 'See famous landmarks like the Big Ben and Buckingham Palace.';
        case 'New York':
            return 'Experience Broadway shows and Central Park.';
        case 'Tokyo':
            return 'Explore traditional shrines and modern districts.';
        case 'Sydney':
            return 'Discover the Sydney Opera House and Bondi Beach.';
        default:
            return 'Unknown details';
    }
}


function getTourPrice(city) {
    switch (city) {
        case 'Astana':
            return 1499;
        case 'London':
            return 1899;
        case 'New York':
            return 1699;
        case 'Tokyo':
            return 1999;
        case 'Sydney':
            return 2099;
        default:
            return 0;
    }
}

function bookTour(city) {

    $('#bookingModal').modal('show');


    const adults = parseInt(document.getElementById('adults').value);
    const children = parseInt(document.getElementById('children').value);
    const totalPrice = calculateTotalPrice(city, adults, children);
    document.getElementById('totalPrice').innerText = `$${totalPrice.toFixed(2)}`;
    $('#bookingModal').modal('show');


    updateTotalPrice();
}

function calculateTotalPrice(city) {

    const adults = parseInt(document.getElementById('adultsQuantity').value) || 0;
    const children = parseInt(document.getElementById('childrenQuantity').value) || 0;
    const price = getTourPrice(city);
    const totalPrice = price * (adults + children * 0.5);
    return totalPrice;
}

function updateTotalPrice() {
    const city = document.getElementById('cityDropdown').value;
    const adultsInput = document.getElementById('adultsQuantity');
    const childrenInput = document.getElementById('childrenQuantity');


    const adults = parseInt(adultsInput.value, 10) || 0;
    const children = parseInt(childrenInput.value, 10) || 0;

    console.log('Adults:', adults);
    console.log('Children:', children);

    const price = getTourPrice(city);
    console.log('Price:', price);

    const totalPrice = price * (adults + children * 0.5);
    console.log('Total Price:', totalPrice);

    document.getElementById('totalPrice').innerText = `$${totalPrice.toFixed(2)}`;
}

function confirmBooking() {
    const city = document.getElementById('cityDropdown').value;
    const adults = parseInt(document.getElementById('adultsQuantity').value, 10) || 0;
    const children = parseInt(document.getElementById('childrenQuantity').value, 10) || 0;

    saveBookingToHistory(city, adults, children);
}

async function saveBookingToHistory(city, adults, children) {
    try {
        const response = await fetch('/saveBookingToHistory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ city, adults, children }),
        });

        if (response.ok) {
            console.log('Booking information saved to history successfully.');
        } else {
            const errorMessage = await response.text();
            console.error(`Failed to save booking information to history. Error: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error saving booking information to history:', error);
    }
}


async function viewHistory() {
    try {
        const response = await fetch('/history');
        const historyData = await response.json();

        if (response.ok) {
            // Display history data in a modal
            displayHistoryModal(historyData.history);
        } else {
            console.error('Failed to fetch history data.');
        }
    } catch (error) {
        console.error('Error fetching history data:', error);
    }
}

function displayHistoryModal(history) {
    const modalBody = document.getElementById('historyModalBody');

    // Clear existing content in the modal body
    modalBody.innerHTML = '';

    // Create a table to display history data
    const table = document.createElement('table');
    table.className = 'table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['City', 'Adults', 'Children', 'Timestamp', 'Actions'];

    headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Populate table rows with history data
    history.forEach((entry, index) => {
        const row = document.createElement('tr');
        const { city, adults, children, timestamp } = entry;

        // Create a cell for the "City" column
        const cityCell = document.createElement('td');
        cityCell.textContent = city;
        row.appendChild(cityCell);

        // Create a cell for the "Adults" column
        const adultsCell = document.createElement('td');
        adultsCell.textContent = adults;
        row.appendChild(adultsCell);

        // Create a cell for the "Children" column
        const childrenCell = document.createElement('td');
        childrenCell.textContent = children;
        row.appendChild(childrenCell);

        // Create a cell for the "Timestamp" column
        const timestampCell = document.createElement('td');
        timestampCell.textContent = timestamp;
        row.appendChild(timestampCell);

        // Create a cell for the "Actions" column
        const actionsCell = document.createElement('td');

        // Create a "Delete" button with a click event listener
        const deleteButton = createButton('Delete', () => deleteHistoryEntry(index));
        actionsCell.appendChild(deleteButton);

        // Append the "Actions" cell to the row
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Append the table to the modal body
    modalBody.appendChild(table);

    // Show the modal
    $('#historyModal').modal('show');
}
function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-primary';
    button.textContent = text;
    button.addEventListener('click', clickHandler);
    return button;
}


async function deleteHistoryEntry(index) {
    try {
        const response = await fetch('/deleteHistoryEntry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index }),
        });

        if (response.ok) {
            console.log('History entry deleted successfully.');

            viewHistory();
        } else {
            console.error('Failed to delete history entry.');
        }
    } catch (error) {
        console.error('Error deleting history entry:', error);
    }
}