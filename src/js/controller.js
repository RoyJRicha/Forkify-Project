import { async } from 'regenerator-runtime';
import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (model.hot) {
  model.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1, -1);
    // console.log(`ID ${id}`);

    if (!id) return;
    console.log('err1');
    recipeView.renderSpinner();

    // 0 results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1 Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
    
    // 2 Loading recipe
    await model.loadRecipe(id);
    console.log('err2');
    
    // 3 Rendering recipe
    console.log(`MODEL RECIPE: ${model.state.recipe}`);
    recipeView.render(model.state.recipe);
    
    console.log('err3');
  } catch (err) {
    // alert(`Show recipe Error: ${err}`);
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1 get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2 load search results
    await model.loadSearchResults(query);

    // 3 Render results
    // resultsView.render(model.state.search.results);
    console.log('resultsview');
    resultsView.render(model.getSearchResultsPage());

    // 4 Render initial pagination buttons
    console.log('paginationview');
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 3 Render NEW results
  // resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4 Render NEW  pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  // Add / Remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update recipe view
  recipeView.update(model.state.recipe)

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();
    
    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000)

    setTimeout(function() {
      addRecipeView.renderUploadForm();
    }, MODAL_CLOSE_SEC * 1250)
  } catch(err) {
    console.log(`ADD RECIPE ERROR ${err}`);
    addRecipeView.renderError(err.message)
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
