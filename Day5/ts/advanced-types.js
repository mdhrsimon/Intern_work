"use strict";
// ==========================================
// TYPESCRIPT ADVANCED TYPES
// ==========================================
const student1 = {
    name: "Simon",
    age: 22,
    course: "BSc CSIT"
};
const student2 = {
    name: "Ram",
    age: 21,
    course: "BSc CSIT"
};
console.log(student1);
console.log(student2);
let userId = 100;
userId = "ABC123";
console.log(userId);
// ==========================================
// 3. UNION TYPES
// ==========================================
// A variable can contain
// string OR number.
let value;
value = "Hello";
value = 100;
console.log(value);
// Function using union
function printId(id) {
    console.log(`ID: ${id}`);
}
printId(101);
printId("USER101");
// ==========================================
// 4. UNION WITH TYPE CHECKING
// ==========================================
function processValue(value) {
    if (typeof value === "string") {
        console.log(value.toUpperCase());
    }
    else {
        console.log(value.toFixed(2));
    }
}
processValue("hello");
processValue(25);
const employee = {
    name: "Simon",
    age: 22,
    employeeId: 101,
    department: "IT"
};
console.log(employee);
// ==========================================
// 6. LITERAL TYPES
// ==========================================
// Only these exact values are allowed.
let direction;
direction = "left";
console.log(direction);
// This would produce an error:
// direction = "hello";
// ==========================================
// LITERAL TYPE WITH FUNCTION
// ==========================================
function move(direction) {
    console.log(`Moving ${direction}`);
}
move("left");
move("right");
// ==========================================
// 7. NULLABLE TYPES
// ==========================================
let username;
username = "Simon";
username = null;
console.log(username);
// ==========================================
// 8. NULLABLE FUNCTION PARAMETER
// ==========================================
function printUsername(username) {
    if (username === null) {
        console.log("No username");
    }
    else {
        console.log(`Username: ${username}`);
    }
}
printUsername("Simon");
printUsername(null);
const user = {
    name: "Simon"
};
// Without optional chaining:
//
// console.log(user.address.city);
//
// This can cause an error because
// address may not exist.
// With optional chaining:
console.log(user.address?.city);
// ==========================================
// 10. NULLISH COALESCING
// ==========================================
const city = user.address?.city ?? "Unknown";
console.log(city);
const account = {
    id: 101,
    username: "Simon",
    role: "user",
    email: null
};
console.log(account.username);
console.log(account.role);
console.log(account.email);
console.log(account.address?.city ?? "No city");
