document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const selectedTourElem = document.getElementById('selectedTour');
    const weatherConditionsElem = document.getElementById('weatherConditions');
    const historyListElem = document.getElementById('historyList');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedTourDetails = getSelectedTourDetailsFromForm();
        selectedTourElem.innerText = selectedTourDetails;


        const weatherConditions = getWeatherConditionsFromServer();
        weatherConditionsElem.innerText = weatherConditions;


        addToHistory(selectedTourDetails);

        // Clear the form
        form.reset();
    });

    function getSelectedTourDetailsFromForm() {

        return 'Selected Tour Details';
    }

    function getWeatherConditionsFromServer() {
        return 'Sunny';
    }

    function addToHistory(selectedTourDetails) {

        const listItem = document.createElement('li');
        listItem.innerText = selectedTourDetails;
        historyListElem.appendChild(listItem);
    }
});
