// movie-details.js

// Wait for the DOM to load before running our scripts.
document.addEventListener("DOMContentLoaded", () => {
  // If a movie-details wrapper is present, display the movie details.
  if (document.querySelector(".movie-details-wrapper")) {
    displayMovieDetails();
  }
  // Initialize the search functionality on the movie details page.
  initializeSearch();
});

/**
 * Utility function to get a query parameter value from the URL.
 * @param {string} param - The name of the parameter to retrieve.
 * @returns {string|null} The parameter's value or null if not found.
 */
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * Fetch movie details from the TMDb API using the given movie ID.
 * @param {string} movieId - The movie ID.
 * @returns {Object|null} The movie data, or null if an error occurs.
 */
async function fetchMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Error fetching movie details:", response.statusText);
      return null;
    }
    const movieData = await response.json();
    return movieData;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

/**
 * Retrieves the movie ID from the URL, fetches its details, and updates the DOM.
 * Updates include:
 * - .movie-title: sets to movie.original_title
 * - .movie-rating: sets to movie.vote_average (with a star icon)
 * - .movie-year: sets to movie.release_date
 * - .movie-description: sets to movie.overview
 * - .movie-poster img: updates the src attribute to the movie poster image
 */
async function displayMovieDetails() {
  const movieId = getQueryParam("id");
  if (!movieId) {
    console.error("No movie id provided in URL.");
    return;
  }
  
  const movie = await fetchMovieDetails(movieId);
  if (!movie) return; // Exit if we could not fetch movie details.

  // Update the movie title.
  const titleEl = document.querySelector(".movie-title");
  if (titleEl) titleEl.textContent = movie.original_title;

  // Update the movie rating.
  const ratingEl = document.querySelector(".movie-rating");
  if (ratingEl) {
    ratingEl.innerHTML = `<i class="bi bi-star-fill"></i> ${movie.vote_average}/10`;
  }

  // Update the movie release date/year.
  const yearEl = document.querySelector(".movie-year");
  if (yearEl) yearEl.textContent = movie.release_date;

  // Update the movie description.
  const descriptionEl = document.querySelector(".movie-description");
  if (descriptionEl) descriptionEl.textContent = movie.overview;

  // Update the movie poster image.
  const posterImgEl = document.querySelector(".movie-poster img");
  if (posterImgEl && movie.poster_path) {
    posterImgEl.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    posterImgEl.alt = `${movie.original_title} Poster`;
  }
}

/**
 * Initializes search functionality on the movie details page.
 * This function handles the display of the search container,
 * focusing the input, and performing a search (non case-sensitive)
 * when the user presses Enter in the search input.
 */
function initializeSearch() {
  const sidebarSearchIcon = document.querySelector('.sidebar .bi-search');
  const searchContainer = document.querySelector('.navbar .search-container');

  if (sidebarSearchIcon && searchContainer) {
    // Change border color on hover.
    sidebarSearchIcon.addEventListener('mouseenter', () => {
      searchContainer.style.borderColor = 'rgb(255, 70, 70)';
    });

    // Reset border color when the mouse leaves (if input is not focused).
    sidebarSearchIcon.addEventListener('mouseleave', () => {
      if (!searchContainer.contains(document.activeElement)) {
        searchContainer.style.borderColor = '';
      }
    });

    // When clicking the search icon, show the search container and focus the input.
    sidebarSearchIcon.addEventListener('click', () => {
      const searchInput = searchContainer.querySelector('.search-input');
      searchContainer.style.display = 'flex';
      searchContainer.style.borderColor = 'rgb(255, 70, 70)';
      if (searchInput) {
        searchInput.focus();
      }
    });

    // Listen for the "Enter" key press in the search input.
    const searchInput = searchContainer.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch(searchInput.value);
        }
      });
    }
  }
}

/**
 * Performs a movie search using the TMDb search API.
 * The search process is non case-sensitive.
 * If results are found, automatically selects the first movie and navigates
 * to movie-details.html with the new movie's ID.
 *
 * @param {string} query - The search query entered by the user.
 */
function performSearch(query) {
  // Normalize the query: trim whitespace and convert to lowercase.
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") {
    return; // Do nothing if the search query is empty.
  }
  
  const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(normalizedQuery)}&page=1&include_adult=false`;
  console.log("Searching for movie:", normalizedQuery, searchUrl);

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        // Automatically select the first search result.
        const movie = data.results[0];
        // Redirect to the movie details page with the movie ID as a query parameter.
        window.location.href = `movie-details.html?id=${movie.id}`;
      } else {
        alert("No results found for your search.");
      }
    })
    .catch(error => {
      console.error("Error searching for movie:", error);
    });
}
