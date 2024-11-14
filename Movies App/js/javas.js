const apiKey = '96ba38246729acc46f4a7c27d644ce1d';
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const moviesContainer = document.querySelector('#movies-container');
const sortSelect = document.querySelector('#sort-select');
const modal = document.querySelector('#movie-modal');
const closeModal = document.querySelector('#close-modal');
const modalBody = document.querySelector('#modal-body');
const watchlistContainer = document.querySelector('#watchlist-container');

async function fetchMovies(query = '', sortBy = 'popularity.desc') {
    const url = query 
        ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&sort_by=${sortBy}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=${sortBy}`;
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
}

function displayMovies(movies) {
    moviesContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.dataset.id = movie.id;

        const posterPath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'placeholder.jpg';

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-release-date">${movie.release_date}</p>
            </div>
        `;

        moviesContainer.appendChild(movieCard);
    });
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    fetchMovies(query, sortSelect.value);
});

sortSelect.addEventListener('change', () => {
    const query = searchInput.value.trim();
    fetchMovies(query, sortSelect.value);
});

moviesContainer.addEventListener('click', async (e) => {
    const movieCard = e.target.closest('.movie-card');
    if (movieCard) {
        const movieId = movieCard.dataset.id;
        const movieDetails = await fetchMovieDetails(movieId);
        openModal(movieDetails);
    }
});

async function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,reviews,videos`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function openModal(movie) {
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'placeholder.jpg';

    const trailer = movie.videos.results.find(video => video.type === 'Trailer');
    const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : '';

    modalBody.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <p><strong>Rating:</strong> ${movie.vote_average} | <strong>Runtime:</strong> ${movie.runtime} mins</p>
        <p><strong>Cast:</strong> ${movie.credits.cast.slice(0, 5).map(member => member.name).join(', ')}</p>
        <p><strong>Director:</strong> ${movie.credits.crew.find(member => member.job === 'Director')?.name || 'N/A'}</p>
        ${trailerUrl ? `<iframe width="100%" height="315" src="${trailerUrl}" frameborder="0" allowfullscreen></iframe>` : ''}
        <button id="add-watchlist" data-id="${movie.id}">Add to Watchlist</button>
    `;

    document.querySelector('#add-watchlist').addEventListener('click', () => {
        addToWatchlist(movie);
    });

    modal.style.display = 'block';
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

function getWatchlist() {
    return JSON.parse(localStorage.getItem('watchlist')) || [];
}

function saveWatchlist(watchlist) {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function addToWatchlist(movie) {
    const watchlist = getWatchlist();
    if (!watchlist.find(item => item.id === movie.id)) {
        watchlist.push({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path
        });
        saveWatchlist(watchlist);
        displayWatchlist();
        alert(`${movie.title} has been added to your watchlist!`);
    } else {
        alert(`${movie.title} is already in your watchlist.`);
    }
}

function removeFromWatchlist(movieId) {
    let watchlist = getWatchlist();
    watchlist = watchlist.filter(movie => movie.id != movieId);
    saveWatchlist(watchlist);
    displayWatchlist();
}

function displayWatchlist() {
    const watchlist = getWatchlist();
    watchlistContainer.innerHTML = '';

    watchlist.forEach(movie => {
        const watchlistCard = document.createElement('div');
        watchlistCard.classList.add('watchlist-card');

        const posterPath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'placeholder.jpg';

        watchlistCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}">
            <div class="watchlist-info">
                <h4>${movie.title}</h4>
            </div>
            <button class="remove-watchlist" data-id="${movie.id}">&times;</button>
        `;

        watchlistContainer.appendChild(watchlistCard);
    });

    document.querySelectorAll('.remove-watchlist').forEach(button => {
        button.addEventListener('click', () => {
            const movieId = button.dataset.id;
            removeFromWatchlist(movieId);
        });
    });
}

fetchMovies();
displayWatchlist();
