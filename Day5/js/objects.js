// ==========================================
// JAVASCRIPT OBJECTS
// ==========================================


// Creating an object

const student = {

    name: "Simon",
    age: 22,
    course: "BSc CSIT",
    isStudent: true

};

console.log(student);


// ==========================================
// ACCESSING PROPERTIES
// ==========================================

console.log(student.name);
console.log(student.age);


// Bracket notation

console.log(student["course"]);


// ==========================================
// CHANGING PROPERTY
// ==========================================

student.age = 23;

console.log(student);


// ==========================================
// ADDING PROPERTY
// ==========================================

student.city = "Kathmandu";

console.log(student);


// ==========================================
// DELETING PROPERTY
// ==========================================

delete student.isStudent;

console.log(student);


// ==========================================
// OBJECT METHOD
// ==========================================

const person = {

    name: "Simon",

    greet: function () {
        console.log(`Hello, I am ${this.name}`);
    }

};

person.greet();


// ==========================================
// OBJECT DESTRUCTURING
// ==========================================

const user = {

    username: "Simon",
    age: 22

};

const { username, age } = user;

console.log(username);
console.log(age);


// ==========================================
// NESTED OBJECT
// ==========================================

const studentInfo = {

    name: "Simon",

    address: {

        city: "Kathmandu",
        country: "Nepal"

    }

};

console.log(studentInfo.address.city);


// ==========================================
// ARRAY OF OBJECTS
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

console.log(students[0].name);

for (let student of students) {

    console.log(student.name);

}


// ==========================================
// OBJECT SPREAD
// ==========================================

const originalUser = {

    name: "Simon",
    age: 22

};

const updatedUser = {

    ...originalUser,
    age: 23,
    city: "Kathmandu"

};

console.log(updatedUser);