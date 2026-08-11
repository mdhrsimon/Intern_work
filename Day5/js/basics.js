// ==========================================
// JAVASCRIPT BASICS
// ==========================================

// 1. VARIABLES
let name = "Simon";
const age = 22;
var city = "Kathmandu";

console.log("Name:", name);
console.log("Age:", age);
console.log("City:", city);


// ==========================================
// 2. DATA TYPES
// ==========================================

let username = "Simon";       // String
let studentAge = 22;          // Number
let isStudent = true;         // Boolean
let emptyValue = null;        // Null
let notDefined;               // Undefined

console.log(typeof username);
console.log(typeof studentAge);
console.log(typeof isStudent);
console.log(typeof emptyValue);
console.log(typeof notDefined);


// ==========================================
// 3. OPERATORS
// ==========================================

let a = 10;
let b = 3;

console.log(a + b);
console.log(a - b);
console.log(a * b);
console.log(a / b);
console.log(a % b);

console.log(a > b);
console.log(a < b);
console.log(a === b);
console.log(a !== b);


// ==========================================
// 4. IF / ELSE
// ==========================================

let marks = 75;

if (marks >= 80) {
    console.log("Excellent");
} else if (marks >= 60) {
    console.log("Good");
} else {
    console.log("Needs improvement");
}


// ==========================================
// 5. TERNARY OPERATOR
// ==========================================

let result = marks >= 40 ? "Pass" : "Fail";

console.log(result);


// ==========================================
// 6. SWITCH
// ==========================================

let day = 2;

switch (day) {
    case 1:
        console.log("Sunday");
        break;

    case 2:
        console.log("Monday");
        break;

    case 3:
        console.log("Tuesday");
        break;

    default:
        console.log("Invalid day");
}


// ==========================================
// 7. FOR LOOP
// ==========================================

for (let i = 1; i <= 5; i++) {
    console.log("Number:", i);
}


// ==========================================
// 8. WHILE LOOP
// ==========================================

let count = 1;

while (count <= 5) {
    console.log("Count:", count);
    count++;
}


// ==========================================
// 9. STRING METHODS
// ==========================================

let message = "Hello JavaScript";

console.log(message.length);
console.log(message.toUpperCase());
console.log(message.toLowerCase());
console.log(message.includes("JavaScript"));
console.log(message.startsWith("Hello"));
console.log(message.endsWith("Script"));


// ==========================================
// 10. TEMPLATE LITERALS
// ==========================================

let firstName = "Simon";
let userAge = 22;

console.log(`My name is ${firstName} and I am ${userAge} years old.`);


// ==========================================
// 11. TYPE CONVERSION
// ==========================================

let numberString = "100";

let number = Number(numberString);

console.log(number);
console.log(typeof number);


// ==========================================
// 12. NULLISH / DEFAULT VALUE
// ==========================================

let userName = null;

console.log(userName ?? "Guest");