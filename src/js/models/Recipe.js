import axios from 'axios';
import {key, proxy} from '../config';


export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try {
            const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
            //console.log(res);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            
        } catch(error) {
            console.log(error);
        }
    }

    calcTime(){
        //Assuming that we need 15 min for every 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g' ];

        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2) Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng ={
                count:1,
                unit:'',
                ingredient:'' 
            
            };
            let count =1;
            if (unitIndex > -1 && arrIng[unitIndex] === arrIng[0]) {
                // There is a unit
                objIng = {
                    count:count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } 
            else if (unitIndex > -1 && arrIng[unitIndex] !== arrIng[0]) {
                // There is a unit
                // Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
                // Ex. 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count:count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } 
            else if (parseInt(arrIng[0], 10) && isNaN(parseInt(arrIng[0].charAt(arrIng[0].length-1)))){ 
                //A unit sticked to number
                let getunits = parseInt(arrIng[0], 10);
                objIng = {
                    count: getunits,
                    unit: arrIng[0].charAt(arrIng[0].length-1),
                    ingredient: arrIng.slice(1).join(' ')
                };
            } 
            else if (parseInt(arrIng[0], 10)) {
                // There is NO unit, but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            
            //console.log(objIng);
            if(objIng.count === 0){
                objIng.count+=1;
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    }
    
}


