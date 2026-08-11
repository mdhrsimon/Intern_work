"use strict";
// ==========================================
// TYPESCRIPT FUNCTIONS
// ==========================================
// ==========================================
// 1. FUNCTION PARAMETERS
// ==========================================
function greet(name) {
    console.log(`Hello ${name}`);
}
greet("Simon");
// ==========================================
// 2. RETURN TYPE
// ==========================================
function add(a, b) {
    return a + b;
}
console.log(add(10, 20));
// ==========================================
// 3. MULTIPLE TYPES
// ==========================================
function formatId(id) {
    return `ID: ${id}`;
}
console.log(formatId(100));
console.log(formatId("ABC"));
// ==========================================
// 4. OPTIONAL PARAMETER
// ==========================================
function introduce(name, age) {
    if (age !== undefined) {
        console.log(`My name is ${name} and I am ${age}`);
    }
    else {
        console.log(`My name is ${name}`);
    }
}
introduce("Simon");
introduce("Simon", 22);
// ==========================================
// 5. DEFAULT PARAMETER
// ==========================================
function welcome(name = "Guest") {
    console.log(`Welcome ${name}`);
}
welcome();
welcome("Simon");
// ==========================================
// 6. ARROW FUNCTION
// ==========================================
const multiply = (a, b) => {
    return a * b;
};
console.log(multiply(5, 4));
// ==========================================
// 7. SHORT ARROW FUNCTION
// ==========================================
const square = (number) => number * number;
console.log(square(5));
// ==========================================
// 8. FUNCTION TYPE
// ==========================================
let operation;
operation = (a, b) => {
    return a + b;
};
console.log(operation(10, 20));
// ==========================================
// 9. REST PARAMETERS
// ==========================================
function sum(...numbers) {
    let total = 0;
    for (const number of numbers) {
        total += number;
    }
    return total;
}
console.log(sum(1, 2, 3));
console.log(sum(10, 20, 30, 40));
