const INITIAL_MEAL_LIMIT = 20;
const MEALS_PER_VIEW = 3;

const container = document.querySelector('[data-meals-container]');
const search = document.querySelector('[data-search]');
const searchResult = document.querySelector('[data-search-result]');
const showMore = document.querySelector('[data-show-more-btn]');
const banner = document.querySelector('[data-banner]');
const scrollBottomAnchor = document.querySelector('[data-scroll-bottom-anchor]');

let foundMeals;
let cycles = 0;
let searchResultHTML = '';

let player;

const getMealByName = async ({ name }) => {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  };
};

/**
 * Function to retrieve a specified number of random meals as objects.
 *
 * @param {number} numberOfMeals - The desired count of random meals to be retrieved.
 * @returns {Array<Object>} An array containing objects representing the randomly selected meals.
 *
 * @description 
 * If the numberOfMeals is not provided, the function will use the default quantity value
 * specified by the INITIAL_MEAL_LIMIT variable
 * 
 * @example
 * const randomMeals = getRandomMeals(5);
 * Returns an array containing 5 objects, each representing a randomly selected meal.
 */
const getRandomMeals = async (numberOfMeals = INITIAL_MEAL_LIMIT) => {
  const meals = [];

  for (let index = 0; index < numberOfMeals; index++) {
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await res.json();
      meals.push(data.meals[0]);
    } catch (error) {
      console.error(error);
    };
  };

  return meals;
};

const onPageLoad = () => container.innerHTML = 'Loading...';

const getNumberWords = ({ text, limit }) => {
  return text.split(' ').length > limit 
    ? text.split(' ').slice(0, limit).join(' ').concat(' ...')
    : text
};

// # This function is called when the page is first loaded to display meals to the user.
const renderInitialMeals = async () => {
  const data = await getRandomMeals();
  let html = '';

  if (!data) return;

  data.forEach(item => {
    html += `
      <li>
        <a class="meals-item" href="${item.strSource}" title="${item.strMeal}">
          <img class="meals-img" src="${item?.strMealThumb}" alt="${item.strMeal}" loading="lazy">
          <span class="meals-title">${item.strMeal}</span>
        </a>
      </li>
    `
  });

  container.innerHTML = html;
}

const renderSearchResult = () => {
  for (let index = 0; index < MEALS_PER_VIEW; index++) {
    if (foundMeals.length > cycles) {
      const { strMeal, strSource, strMealThumb, strInstructions } = foundMeals[cycles];
      searchResultHTML += `
        <a class="search-item" href="${strSource}" title="${strInstructions}">
          <span class="search-item-title">${strMeal}</span>
          <img class="search-item-img" src="${strMealThumb}" alt="${strMeal}" title="${strMeal}" loading="lazy">
        </a>
      `;
      cycles++;
    };
  };

  searchResult.innerHTML = `<div class="search-result">${searchResultHTML}</div>`;

  // Check if there are more items than currently shown or limited on the page.
  // If so, render the "Show More" button to allow the user to load additional items.
  if (foundMeals.length > cycles) {
    showMore.classList.contains('hidden') && showMore.classList.remove('hidden');
    showMore.addEventListener('click', renderSearchResult, {once: true});
  } else {
    showMore.classList.add('hidden');
  }
};

const renderSearchError = ({ target, result }) => {
  target.elements["search"].placeholder = `'${result}' - Hmm, no results for that meal!`;
};

const resetSearchResults = () => {
  cycles = 0;
  searchResultHTML = '';
};

const scrollToResults = () => {
  scrollBottomAnchor.scrollIntoView({ behavior: "smooth", block: "end" });
};

// This function allows users to find specific meals by entering their names as search criteria.
const searchMealsByName = () => {
  search.addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = e.target.elements["search"].value;
    if (!result) return;

    const { meals } = await getMealByName({ name: result });

    e.target.elements["search"].value = '';
    e.target.elements["search"].placeholder = 'Search for a delicious meal';
    
    if (meals) {
      foundMeals = meals;
      resetSearchResults();
      renderSearchResult();
      scrollToResults();
    } else renderSearchError({ target: e.target, result })
  })
};

const renderBanner = async () => {
  const data = await getRandomMeals(1);
  if (!data) return;

  const {
    strMealThumb,
    strMeal,
    strInstructions,
    strTags,
    strYoutube
  } = data[0];


  banner.querySelector('.banner-heading').textContent = strMeal;
  banner.querySelector('.banner-img').src = strMealThumb;
  banner.querySelector('.banner-copy').textContent = strInstructions;
  banner.querySelector('.banner-tags').textContent = strTags;
}

// Function to create the YouTube player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('playerContainer', {
    height: '600px', // Set the height of the player
    width: '100%', // Set the width of the player
    videoId: 'DDaZoXP1Mdc', // Replace with your YouTube video ID DDaZoXP1Mdc
    playerVars: {
      'autoplay': 1, // Set to 1 for autoplay
      'controls': 0, // Set to 0 to hide YouTube controls
      'rel': 0, // Set to 0 to disable related videos at the end
      'showinfo': 0 // Set to 0 to hide video title and uploader info
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// Function to execute when the player is ready
function onPlayerReady(event) {
  // Optional code to perform actions when the player is ready
}

// Function to execute when the player's state changes (e.g., when the video ends)
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    // Optional code to perform actions when the video ends
  }
}


const init = () => {
  onPageLoad();
  renderInitialMeals();
  searchMealsByName();
  renderBanner();
};

document.addEventListener("DOMContentLoaded", init);
