"use strict";
// ==========================================
// TYPESCRIPT OBJECTS
// ==========================================
// ==========================================
// 1. OBJECT WITH TYPES
// ==========================================
const student = {
    name: "Simon",
    age: 22,
    course: "BSc CSIT"
};
console.log(student);
// ==========================================
// 2. ACCESSING OBJECT
// ==========================================
console.log(student.name);
console.log(student.age);
// ==========================================
// 3. OBJECT WITH OPTIONAL PROPERTY
// ==========================================
const user = {
    name: "Simon",
    age: 22
};
console.log(user);
// ==========================================
// 4. NESTED OBJECT
// ==========================================
const person = {
    name: "Simon",
    address: {
        city: "Kathmandu",
        country: "Nepal"
    }
};
console.log(person.address.city);
// ==========================================
// 5. ARRAY OF OBJECTS
// ==========================================
const students = [
    {
        name: "Simon",
        age: 22
    },
    {
        name: "Ram",
        age: 21
    },
    {
        name: "Hari",
        age: 23
    }
];
for (const student of students) {
    console.log(student.name);
}
// ==========================================
// 6. OBJECT DESTRUCTURING
// ==========================================
const studentData = {
    name: "Simon",
    age: 22
};
// TypeScript already knows:
// name -> string
// age  -> number
const { name, age } = studentData;
console.log(name);
console.log(age);
// ==========================================
// 7. OBJECT SPREAD
// ==========================================
const oldUser = {
    name: "Simon",
    age: 22
};
const newUser = {
    ...oldUser,
    age: 23,
    city: "Kathmandu"
};
console.log(newUser);
