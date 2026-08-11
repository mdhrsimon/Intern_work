"use strict";
// ==========================================
// TYPESCRIPT BASICS
// ==========================================
// ==========================================
// 1. VARIABLES WITH TYPES
// ==========================================
let name = "Simon";
let age = 22;
let isStudent = true;
console.log(name);
console.log(age);
console.log(isStudent);
// ==========================================
// 2. TYPE INFERENCE
// ==========================================
// TypeScript automatically understands
// that this is a string.
let city = "Kathmandu";
// city = 100;
// Error
// ==========================================
// 3. ANY
// ==========================================
let data = "Hello";
data = 100;
data = true;
console.log(data);
// ==========================================
// 4. UNKNOWN
// ==========================================
let unknownValue = "Hello";
if (typeof unknownValue === "string") {
    console.log(unknownValue.toUpperCase());
}
// ==========================================
// 5. VOID
// ==========================================
function sayHello() {
    console.log("Hello");
}
sayHello();
// ==========================================
// 6. NEVER
// ==========================================
// A function that never finishes normally.
function throwError(message) {
    throw new Error(message);
}
// throwError("Something went wrong");
// ==========================================
// 7. TYPE ASSERTION
// ==========================================
let someValue = "Hello TypeScript";
let stringValue = someValue;
console.log(stringValue.length);
// ==========================================
// 8. UNION BASIC
// ==========================================
let id;
id = 100;
id = "ABC123";
console.log(id);
