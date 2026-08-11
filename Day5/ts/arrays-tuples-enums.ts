// ==========================================
// TYPESCRIPT ARRAYS
// ==========================================


// Array of strings

let fruits: string[] = [
    "Apple",
    "Banana",
    "Mango"
];


// Array of numbers

let numbers: number[] = [
    1,
    2,
    3,
    4,
    5
];


// Another syntax

let scores: Array<number> = [
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

let doubled: number[] = numbers.map(
    number => number * 2
);

console.log(doubled);


let evenNumbers: number[] = numbers.filter(
    number => number % 2 === 0
);

console.log(evenNumbers);


// ==========================================
// UNION ARRAY
// ==========================================

let mixed: (string | number)[] = [

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

let person: [string, number] = [
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

let student: [string, number, boolean] = [
    "Simon",
    22,
    true
];

console.log(student);


// ==========================================
// ENUM
// ==========================================

enum Role {

    Admin,
    User,
    Guest

}

let userRole: Role = Role.Admin;

console.log(userRole);


// ==========================================
// STRING ENUM
// ==========================================

enum Status {

    Pending = "PENDING",
    Approved = "APPROVED",
    Rejected = "REJECTED"

}

let currentStatus: Status = Status.Approved;

console.log(currentStatus);