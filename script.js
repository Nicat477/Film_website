// script.js

// ---------------------------
// SEARCH FUNCTIONALITY
// ---------------------------
function initializeSearch() {
  const sidebarSearchIcon = document.querySelector('.sidebar .bi-search');
  const searchContainer = document.querySelector('.navbar .search-container');

  if (sidebarSearchIcon && searchContainer) {
    // When hovering over the search icon, change border color
    sidebarSearchIcon.addEventListener('mouseenter', () => {
      searchContainer.style.borderColor = 'rgb(255, 70, 70)';
    });

    // When mouse leaves the search icon, reset border color (if input is not focused)
    sidebarSearchIcon.addEventListener('mouseleave', () => {
      if (!searchContainer.contains(document.activeElement)) {
        searchContainer.style.borderColor = '';
      }
    });

    // When clicking the search icon, display the search container and focus the input
    sidebarSearchIcon.addEventListener('click', () => {
      const searchInput = searchContainer.querySelector('.search-input');
      searchContainer.style.display = 'flex';
      searchContainer.style.borderColor = 'rgb(255, 70, 70)';
      if (searchInput) {
        searchInput.focus();
      }
    });

    // Add event listener for the search input for "Enter" key press
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
 * Calls the TMDb search API with the provided query.
 * If results are found, automatically selects the first result and navigates to movie-details.html.
 *
 * @param {string} query - The search query entered by the user.
 */
function performSearch(query) {
  // Normalize the query: trim whitespace and convert to lowercase.
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") {
    return; // Do nothing if the search query is empty
  }
  const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(normalizedQuery)}&page=1&include_adult=false`;
  console.log("Searching for movie:", normalizedQuery, searchUrl);

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        // Automatically select the first search result
        const movie = data.results[0];
        // Redirect to the movie details page with the movie ID as a query parameter
        window.location.href = `movie-details.html?id=${movie.id}`;
      } else {
        alert("No results found for your search.");
      }
    })
    .catch(error => {
      console.error("Error searching for movie:", error);
    });
}

// ---------------------------
// STORE ORIGINAL ORDER
// ---------------------------
// After the movies have been loaded, store each movie's original position.
// This is useful for restoring the default order.
function storeOriginalOrder() {
  const movieLists = document.querySelectorAll(".movie-list");
  movieLists.forEach(list => {
    const itemsArray = Array.from(list.children);
    itemsArray.forEach((item, index) => {
      item.setAttribute("data-original-index", index);
    });
  });
}

// ---------------------------
// SORTING FUNCTIONALITY (REPLACES ORIGINAL FILTERING)
// ---------------------------
// This function sorts movies in each movie list based on the selected property.
// Options (from the <select>):
// - "default": Restore original order
// - "vote_average": Sort by Average Rating (descending)
// - "release_date": Sort by Release Date (descending)
// - "popularity": Sort by Popularity (descending)
function initializeFiltering() {
  const filterSelect = document.getElementById("myFilter");

  filterSelect.addEventListener("change", sortMovies);
  // Optionally, you can call sortMovies() here to sort on initial load if needed.
}

function sortMovies() {
  const filterSelect = document.getElementById("myFilter");
  const selectedValue = filterSelect.value;
  // Get all movie lists (popular, now playing, upcoming)
  const movieLists = document.querySelectorAll(".movie-list");

  movieLists.forEach((list) => {
    const itemsArray = Array.from(list.children);

    if (selectedValue === "default") {
      // Restore the original order based on data-original-index
      itemsArray.sort((a, b) => {
        return parseInt(a.getAttribute("data-original-index"), 10) - parseInt(b.getAttribute("data-original-index"), 10);
      });
    } else {
      // Sort items in descending order based on the selected property
      itemsArray.sort((a, b) => {
        const dataA = a.getAttribute("data-movie");
        const dataB = b.getAttribute("data-movie");
      
        if (!dataA || !dataB) {
          console.warn("Skipping item due to missing data-movie:", a, b);
          return 0; // Keep order unchanged
        }
      
        let movieA, movieB;
        try {
          movieA = JSON.parse(dataA);
          movieB = JSON.parse(dataB);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          return 0; // Keep order unchanged
        }
      
        let valueA = movieA[selectedValue];
        let valueB = movieB[selectedValue];
      
        if (selectedValue === "release_date") {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        }
      
        return valueB - valueA; // Descending order
      });
    }
    // Clear the current list and re-append sorted items
        list.innerHTML = "";
    itemsArray.forEach(item => {
      item.style.display = "block"; // Adjust as needed
      list.appendChild(item);
});
  });
}

// ---------------------------
// MOVIE ITEM CLICK HANDLING
// ---------------------------
// When a movie item is clicked, navigate to its details page.
function initializeMovieItemClicks() {
  document.querySelectorAll(".movie-item").forEach((item) => {
    item.addEventListener("click", () => {
      const movieId = item.dataset.movieId;
      if (movieId) {
        window.location.href = `movie-details.html?id=${movieId}`;
      } else {
        console.error("Movie ID is missing for this item.");
      }
    });
  });
}

// ---------------------------
// ARROW (HORIZONTAL SCROLL) FUNCTIONALITY
// ---------------------------
function initializeArrows() {
  const leftArrows = document.querySelectorAll(".bi-chevron-left");
  const rightArrows = document.querySelectorAll(".bi-chevron-right");
  const movieLists = document.querySelectorAll(".movie-list");

  movieLists.forEach((movieList, index) => {
    let clickCounter = 0;
    const itemNumber = movieList.querySelectorAll("img").length;
    const ratio = Math.floor(window.innerWidth / 300);

    // Initially hide left arrows since we start at the beginning
    leftArrows[index].classList.add('hide');

    // Right arrow click handler
    rightArrows[index].addEventListener("click", () => {
      const remainingItems = itemNumber - (4 + clickCounter) + (4 - ratio);
      if (remainingItems > 0) {
        clickCounter++;
        movieList.style.transform = `translateX(${-300 * clickCounter}px)`;
        leftArrows[index].classList.remove('hide'); // Show left arrow

        // Hide right arrow if we reached the end
        if (remainingItems <= 4) {
          rightArrows[index].classList.add('hide');
        }
      }
    });

    // Left arrow click handler
    leftArrows[index].addEventListener("click", () => {
      if (clickCounter > 0) {
        clickCounter--;
        movieList.style.transform = `translateX(${-300 * clickCounter}px)`;
        rightArrows[index].classList.remove('hide'); // Show right arrow

        // Hide left arrow if we're back at the start
        if (clickCounter === 0) {
          leftArrows[index].classList.add('hide');
        }
      }
    });

    // Add hover effects to the arrows
    [leftArrows[index], rightArrows[index]].forEach(arrow => {
      arrow.addEventListener('mouseenter', () => {
        if (!arrow.classList.contains('hide')) {
          arrow.classList.add('active');
        }
      });
      arrow.addEventListener('mouseleave', () => {
        arrow.classList.remove('active');
      });
    });

    // Update arrows on window resize
    window.addEventListener('resize', () => {
      const newRatio = Math.floor(window.innerWidth / 300);
      if (newRatio !== ratio) {
        clickCounter = 0;
        movieList.style.transform = 'translateX(0)';
        leftArrows[index].classList.add('hide');
        rightArrows[index].classList.remove('hide');
      }
    });
  });
}

// ---------------------------
// DARK/LIGHT MODE TOGGLE
// ---------------------------
const ball = document.querySelector(".toggle-ball");
const items = document.querySelectorAll(
  ".container, .navbar, .sidebar, .sidebar i, .toggle, .toggle-ball, .movie-list-filter select, .movie-list-title"
);
ball.addEventListener("click", () => {
  items.forEach((item) => item.classList.toggle("active"));
});

// ---------------------------
// INITIALIZATION ON DOMContentLoaded
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // Load movies into each section.
  await displayMovies("popular", "#popular-movies");
  await displayMovies("now_playing", "#now-playing-movies");
  await displayMovies("upcoming", "#upcoming-movies");
  
  // Once movies are loaded, store their original order.
  storeOriginalOrder();
  
  // Initialize sorting (filtering), movie item clicks, arrow navigation, and search functionality.
  initializeFiltering();
  initializeMovieItemClicks();
  initializeArrows();
  initializeSearch();
});
