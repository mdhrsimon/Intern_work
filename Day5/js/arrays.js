// ==========================================
// JAVASCRIPT ARRAYS
// ==========================================

// Creating an array

let fruits = ["Apple", "Banana", "Mango"];

console.log(fruits);


// Accessing elements

console.log(fruits[0]);
console.log(fruits[1]);


// Changing an element

fruits[1] = "Orange";

console.log(fruits);


// Adding elements

fruits.push("Grapes");

console.log(fruits);


// Removing last element

fruits.pop();

console.log(fruits);


// Add to beginning

fruits.unshift("Pineapple");

console.log(fruits);


// Remove from beginning

fruits.shift();

console.log(fruits);


// Length

console.log(fruits.length);


// ==========================================
// LOOP THROUGH ARRAY
// ==========================================

for (let fruit of fruits) {
    console.log(fruit);
}


// ==========================================
// forEach
// ==========================================

fruits.forEach(function (fruit) {
    console.log("Fruit:", fruit);
});


// ==========================================
// MAP
// ==========================================

let numbers = [1, 2, 3, 4, 5];

let doubled = numbers.map(function (number) {
    return number * 2;
});

console.log(doubled);


// ==========================================
// FILTER
// ==========================================

let evenNumbers = numbers.filter(function (number) {
    return number % 2 === 0;
});

console.log(evenNumbers);


// ==========================================
// FIND
// ==========================================

let foundNumber = numbers.find(function (number) {
    return number > 3;
});

console.log(foundNumber);


// ==========================================
// INCLUDES
// ==========================================

console.log(numbers.includes(3));
console.log(numbers.includes(10));


// ==========================================
// SPREAD OPERATOR
// ==========================================

let oldArray = [1, 2, 3];

let newArray = [...oldArray, 4, 5];

console.log(newArray);


// ==========================================
// DESTRUCTURING
// ==========================================

let colors = ["Red", "Green", "Blue"];

let [firstColor, secondColor, thirdColor] = colors;

console.log(firstColor);
console.log(secondColor);
console.log(thirdColor);