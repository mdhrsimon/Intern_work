"use strict";
// ==========================================
// TYPESCRIPT ARRAYS
// ==========================================
// Array of strings
let fruits = [
    "Apple",
    "Banana",
    "Mango"
];
// Array of numbers
let numbers = [
    1,
    2,
    3,
    4,
    5
];
// Another syntax
let scores = [
    10,
    20,
    30
];
console.log(fruits);
console.log(numbers);
console.log(scores);
// ==========================================
// ARRAY METHODS
// ==========================================
let doubled = numbers.map(number => number * 2);
console.log(doubled);
let evenNumbers = numbers.filter(number => number % 2 === 0);
console.log(evenNumbers);
// ==========================================
// UNION ARRAY
// ==========================================
let mixed = [
    "Simon",
    22,
    "CSIT",
    100
];
console.log(mixed);
// ==========================================
// TUPLES
// ==========================================
// A tuple has a fixed structure/order.
let person = [
    "Simon",
    22
];
console.log(person[0]);
console.log(person[1]);
// This would be wrong:
// let person: [string, number] = [22, "Simon"];
// ==========================================
// TUPLE WITH THREE VALUES
// ==========================================
let student = [
    "Simon",
    22,
    true
];
console.log(student);
// ==========================================
// ENUM
// ==========================================
var Role;
(function (Role) {
    Role[Role["Admin"] = 0] = "Admin";
    Role[Role["User"] = 1] = "User";
    Role[Role["Guest"] = 2] = "Guest";
})(Role || (Role = {}));
let userRole = Role.Admin;
console.log(userRole);
// ==========================================
// STRING ENUM
// ==========================================
var Status;
(function (Status) {
    Status["Pending"] = "PENDING";
    Status["Approved"] = "APPROVED";
    Status["Rejected"] = "REJECTED";
})(Status || (Status = {}));
let currentStatus = Status.Approved;
console.log(currentStatus);
