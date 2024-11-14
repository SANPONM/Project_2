const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.error');
const forecastContainer = document.querySelector('.forecast-container');

search.addEventListener('click', () => {
    const APIKey = 'be4e0a29432e1bcba79bcccf114ff902';
    const city = document.querySelector('.search-box input').value;

    if (city =='') return;

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => {
            if (json.cod === '404') {
                container.style.height = '400px';
                container.style.width = '300px'
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                error404.classList.add('active');
                forecastContainer.innerHTML = '';
                return;
            }

            container.style.height = '700px';
            container.style.width = '1200px';
            weatherBox.classList.add('active');
            weatherDetails.classList.add('active');
            error404.classList.remove('active');

            const image = document.querySelector('.weather-box img');
            const temperature = document.querySelector('.weather-box .temperature');
            const description = document.querySelector('.weather-box .description');
            const humidity = document.querySelector('.weather-details .humidity span');
            const wind = document.querySelector('.weather-details .wind span');

            const currentWeather = json.list[0];
            temperature.innerHTML = `${parseInt(currentWeather.main.temp)}<span>°C</span>`;
            description.innerHTML = `${currentWeather.weather[0].description}`;
            humidity.innerHTML = `${currentWeather.main.humidity}%`;
            wind.innerHTML = `${parseInt(currentWeather.wind.speed)}km/h`;

            forecastContainer.innerHTML = '';
            const forecastDays = json.list.filter((_, index) => index % 8 === 0).slice(1, 6);
            
            forecastDays.forEach(day => {
                const forecastBox = document.createElement('div');
                forecastBox.classList.add('forecast-box');

                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                
                let iconSrc;

                switch (day.weather[0].main) {
                    case 'Clear':
                        iconSrc = 'images/clear.png';
                        break;
                    case 'Rain':
                        iconSrc = 'images/rain.png';
                        break;
                    case 'Snow':
                        iconSrc = 'images/snow.png';
                        break;
                    case 'Clouds':
                        iconSrc = 'images/cloud.png';
                        break;
                    case 'Mist':
                        iconSrc = 'images/mist.png';
                        break;
                    default:
                        iconSrc = 'images/cloud.png';
                }

                const temp = `${parseInt(day.main.temp)}°C`;
                
                forecastBox.innerHTML = `
                    <p>${dayName}</p>
                    <img src="${iconSrc}" alt="${day.weather[0].main}">
                    <p>${temp}</p>
                `;
                
                forecastContainer.appendChild(forecastBox);
            });
        });
});
