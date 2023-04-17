import * as model from './modal.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeViews.js';
import searchView from './views/searchView.js';
import resoultsView from './views/resoultsView.js';
import bookmarksView from './views/booknarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeViews.js';
import 'core-js/stable';

import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) {
      return;
    }
    recipeView.renderSpinner();

    //update results view to mark selected search result
    resoultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    //1 Loading recipe
    await model.loadRecipe(id);
    // 2 rendering recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchResoults = async function () {
  try {
    resoultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResoults(query);
    // resoultsView.render(model.state.search.resoults);
    resoultsView.render(model.getSearchResultsPage());

    //render pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //Render new results
  resoultsView.render(model.getSearchResultsPage(goToPage));

  //render new pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update recipe servings
  model.updateServings(newServings);
  //update the recipe view
  recipeView.update(model.state.recipe);

  // recipeView.render(model.state.recipe);
};

const controlAddBookmark = function () {
  //Add or remove

  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view
  recipeView.update(model.state.recipe);
  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);
    //success messsage
    addRecipeView.renderMessage();

    //render bookmark
    bookmarksView.render(model.state.bookmarks);
    // change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResoults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
