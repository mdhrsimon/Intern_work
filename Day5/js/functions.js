// ==========================================
// JAVASCRIPT FUNCTIONS
// ==========================================


// 1. NORMAL FUNCTION

function greet() {
    console.log("Hello!");
}

greet();


// ==========================================
// 2. FUNCTION WITH PARAMETERS
// ==========================================

function greetUser(name) {
    console.log(`Hello ${name}`);
}

greetUser("Simon");


// ==========================================
// 3. FUNCTION WITH RETURN
// ==========================================

function add(a, b) {
    return a + b;
}

let result = add(10, 20);

console.log(result);


// ==========================================
// 4. DEFAULT PARAMETERS
// ==========================================

function welcome(name = "Guest") {
    console.log(`Welcome ${name}`);
}

welcome();
welcome("Simon");


// ==========================================
// 5. ARROW FUNCTION
// ==========================================

const multiply = (a, b) => {
    return a * b;
};

console.log(multiply(5, 4));


// Short arrow function

const square = number => number * number;

console.log(square(5));


// ==========================================
// 6. CALLBACK FUNCTION
// ==========================================

function calculate(a, b, operation) {
    return operation(a, b);
}

const addition = (x, y) => x + y;

const subtraction = (x, y) => x - y;

console.log(calculate(10, 5, addition));
console.log(calculate(10, 5, subtraction));


// ==========================================
// 7. REST PARAMETER
// ==========================================

function sum(...numbers) {

    let total = 0;

    for (let number of numbers) {
        total += number;
    }

    return total;
}

console.log(sum(1, 2, 3));
console.log(sum(10, 20, 30, 40));


// ==========================================
// 8. SCOPE
// ==========================================

function testScope() {

    let localVariable = "I am inside function";

    console.log(localVariable);
}

testScope();

// console.log(localVariable);
// This would give an error because
// localVariable exists only inside the function.