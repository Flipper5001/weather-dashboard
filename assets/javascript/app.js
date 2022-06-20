const weatherStatsEl = document.querySelector('.weather-stats');
const todayForecast = document.getElementById('weather-today');
const fiveDayForecast = document.getElementById('five-day-forecast');
const searchHistory = document.getElementById('past-results');
const searchForm = document.getElementById('search');
const userInput = document.getElementById('user-input');
const errorOccured = document.querySelector('.error');
const apiKey = '2beef0ef71607729929c8839335a46a9';

// Fetch call the One Call API
function getOneCallAPI(lat, lon){
    return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`)
    .then(function(response){
        return response.json();
    });
};

// Fetch lat and lon for one call
function getLatLon (cityName){
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`)
    .then(function(response){
        // if failed to retrieve data print zero results
        if(response.status === 404){
            errorOccured.classList.remove('none');
        }
        return response.json();
    })
    // run one call
    .then(function(weatherData){
        return getOneCallAPI(weatherData.coord.lat, weatherData.coord.lon);
    });
};

// placeholder search history
let pastResults = [];

// When the search button is clicked
searchForm.addEventListener('submit', function(event){

    event.preventDefault();

    // get user input for city name
    const cityName = userInput.value;
    // verify input
    if (cityName === ''){
        return
    };

    // empty user input
    userInput.value = '';

    getWeatherData(cityName);
});

function getWeatherData(cityName){
    // clear today forecast element
    todayForecast.textContent = '';
    // hide stats temporarily to allow for refresh
    weatherStatsEl.classList.add('none');
    errorOccured.classList.add('none');
    
    // run fetch functions to retrieve weather data
    getLatLon(cityName)
    // wait for weather data to be retrieved before running next functions
    .then(function(weatherData){
        // current date
        const currentDate = moment(weatherData.current.dt, 'X').format('(DD/MM/YYYY)');

        // verify if result is already in search history
        if (!pastResults.includes(cityName)){
            pastResults.push(cityName);
            localStorage.setItem('history', JSON.stringify(pastResults));
        };
        
        generateSearchHistory();
        
        generateHeaderTitle(weatherData, cityName, currentDate);
        
        generateHeaderInfo(weatherData);
        
        generateCards(weatherData);
    });
    // Primary function to generate all data
    // made into seperate function to make it easy to call from else where (i.e. the search history buttons)
}

// adds cityname to search history side bar
function generateSearchHistory(){
    searchHistory.textContent = '';

    // check local storage for search history
    let storedHistory = JSON.parse(localStorage.getItem("history"));
    if (storedHistory !== null){
        pastResults = storedHistory;
    }

    // generates search history buttons
    for (let i = 0; i < pastResults.length; i++) {
        const pastResult = pastResults[i];
        const button = document.createElement('button');
        button.setAttribute('class','btn-secondary form-control my-2');
        button.textContent = pastResult;

        // button click to get weather data again
        button.addEventListener('click', function(){
            getWeatherData(button.textContent)
        })
        
        searchHistory.appendChild(button);
    }
}

// creates the title and date for the current forecast row
function generateHeaderTitle(weatherData, cityName, currentDate){
    const h1 = document.createElement('h1');
    h1.textContent = cityName + ' ' + currentDate + ' ';
    h1.setAttribute('class','display-5');
    return createIcon(weatherData, h1);
};

// creates the icons present throughout the page with if statements to allow for code reuse
function createIcon(weatherData, h1){
    const img = document.createElement('img');
    img.setAttribute('class','icon');
    if (h1 === undefined){
        img.setAttribute('src','http://openweathermap.org/img/w/' + weatherData.daily[day].weather[0].icon + '.png');
        section.appendChild(img);
    } else {
        img.setAttribute('src','http://openweathermap.org/img/w/' + weatherData.current.weather[0].icon + '.png');
        h1.appendChild(img);
        todayForecast.appendChild(h1);
    };
};

// Creates the information present below the header in the current forecast row, made for convenience and to prevent eventlistener from getting too big
// code required weatherdata so cannot be a global variable to be used with generateCards()
function generateHeaderInfo(weatherData){
    const ul = document.createElement('ul');
    ul.setAttribute("class","list-group")

    // temp || wind || humidity || UV index
    const currentWeatherStats = ['Temp: ' + weatherData.current.temp + '°C', 'Wind: ' + weatherData.current.wind_speed + ' KM/H',
    'Humidity: ' + weatherData.current.humidity + ' %', 'UV index:  ']

    // generate info based on the above array
    for (let i = 0; i < currentWeatherStats.length; i++) {
        const currentWeatherStat = currentWeatherStats[i];
        
        const li = document.createElement('li');
        li.setAttribute('class','list-group-item');
        if(i === currentWeatherStats.length - 1){
            const span = document.createElement('span');
            if(weatherData.current.uvi < 3){
                // uv index must be present in a green background
                span.setAttribute('class','favorable');
            } else if (weatherData.current.uvi > 6){
                // uv index must be present in a red background
                span.setAttribute('class','severe');
            } else {
                // uv index must be present in a orange background
                span.setAttribute('class','moderate');
            };
            span.textContent = weatherData.current.uvi;
            li.textContent = currentWeatherStat;
            li.appendChild(span);
        } else {
            li.textContent = currentWeatherStat;
        };
        ul.appendChild(li);
    };
    todayForecast.appendChild(ul);
};

// generate five day forecast in card form
function generateCards(weatherData){
    fiveDayForecast.textContent = ''
    // 5 days
    for (let day = 1; day < 6; day++) {

        // section element for all cards
        const section = document.createElement('section');
        section.setAttribute('class','card');

        // date
        const h3 = document.createElement('h3');
        const date = moment(weatherData.daily[day].dt, 'X').format('DD/MM/YYYY');
        h3.setAttribute('class','card-list-item font-weight-bold');
        h3.textContent = date;
        section.appendChild(h3);

        // icon
        createIcon(weatherData, section)

        // temp // wind / humidity
        const weatherStats = ['Temp: ' + weatherData.daily[day].temp.day + '°C', 'Wind: ' + weatherData.daily[day].wind_speed + ' KM/H',
        'Humidity: ' + weatherData.daily[day].humidity + ' %'];

        const ul = document.createElement('ul');
        ul.setAttribute("class","list-group");
        // generate info based on the above array
        for (let i = 0; i < weatherStats.length; i++) {
            const weatherStat = weatherStats[i];
            const li = document.createElement('li');
            li.setAttribute('class','card-list-item');
            li.textContent = weatherStat;
            ul.appendChild(li);
        }
        section.appendChild(ul);
        fiveDayForecast.append(section);
    };
    // reveal weather stats after all elements have been rendered to show simultaneously
    weatherStatsEl.classList.remove('none');
};

// when page is refreshed show search history / if searched prior
generateSearchHistory();
