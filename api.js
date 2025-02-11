// api.js
const API_KEY = '012c94d6d6bf4eb79734328aaba1d42a';
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchMoviesByCategory(category) {
    let endpoint = '';
    if (category === 'popular') {
        endpoint = 'popular';
    } else if (category === 'now_playing') {
        endpoint = 'now_playing';
    } else if (category === 'upcoming') {
        endpoint = 'upcoming';
    } else {
        console.error("Invalid category provided:", category);
        return [];
    }

    const url = `${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}&language=en-US&page=1`;
    console.log(`Fetching ${category} movies from:`, url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`TMDb API Error for ${category}:`, errorData);
            throw new Error(`TMDb API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`${category} movies:`, data);
        return data.results;
    } catch (error) {
        console.error(`Error fetching ${category} movies:`, error);
        return [];
    }
}

function createMovieElement(movie) {
    if (!movie || !movie.poster_path) {
        console.warn("Missing movie data:", movie);
        return "";
    }
    const imgUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    return `
        <li class="movie-item default" data-movie-id="${movie.id}" data-movie='${JSON.stringify(movie)}'>
            <img class="movie-item-img" src="${imgUrl}" alt="${movie.title}">
            <div class="movie-item-info">
                <span class="movie-item-title">${movie.title}</span>
                <div class="movie-item-buttons">
                    <i class="bi bi-play-circle-fill"></i>
                    <i class="bi bi-hand-thumbs-up-fill"></i>
                    <i class="bi bi-hand-thumbs-down-fill"></i>
                    <i class="bi bi-plus-circle-fill"></i>
                </div>
            </div>
        </li>
    `;
}

async function displayMovies(category, containerSelector) {
    const movies = await fetchMoviesByCategory(category);
    const movieList = document.querySelector(containerSelector);
    if (!movieList) {
        console.error("Container not found for selector:", containerSelector);
        return;
    }

    if (movies.length === 0) {
        movieList.innerHTML = "<p>No movies found.</p>";
        return;
    }

    const movieElements = movies.map(createMovieElement).join('');
    movieList.innerHTML = movieElements;
}

console.log("api.js script loaded.");