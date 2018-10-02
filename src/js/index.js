import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';
import * as likesView from './views/likesView';

///Global state of the app
    //Search object
    //Current recipe object
    //Shoping list object
    //Liked recipes

const state = {};



////////////////////////////////////////Search Controler
const controlSearch = async () =>{
    // 1 Get query from the view
    const query = searchView.getInput();

    if(query){       
        //2 New search and add to state
        state.search = new Search(query);

        //3 Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{

            //4 Search for recipes
            await state.search.getResults();

            //5render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            console.log(Recipe);
        } catch (error){
            console.log(error);
            clearLoader();
        }
        
    }
}

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();  
});

elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


////////////////////////////////////////Recipe Controler



const controlRecipe = async () => {
    
    //Get id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        //create a new recipe object
        state.recipe = new Recipe(id);
        try {
            //get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calc servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err){
            console.log(err);
            alert('Error processing recipe');
        }
    }
}

//////////////////////Likes controller

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

////////////////Handling recipe button clicks

elements.recipe.addEventListener('click', e =>{
    if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});



///Standard
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);



/// Array of events!!!!

['hashchange', 'load'].forEach(event=> window.addEventListener(event, controlRecipe));


