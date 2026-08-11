// ==========================================
// TYPESCRIPT ADVANCED TYPES
// ==========================================


// ==========================================
// 1. TYPE ALIAS
// ==========================================

// Instead of repeatedly writing:
// { name: string; age: number; }

type Student = {

    name: string;
    age: number;
    course: string;

};


const student1: Student = {

    name: "Simon",
    age: 22,
    course: "BSc CSIT"

};


const student2: Student = {

    name: "Ram",
    age: 21,
    course: "BSc CSIT"

};


console.log(student1);
console.log(student2);


// ==========================================
// 2. TYPE ALIAS FOR SIMPLE TYPES
// ==========================================

type UserId = string | number;

let userId: UserId = 100;

userId = "ABC123";

console.log(userId);


// ==========================================
// 3. UNION TYPES
// ==========================================

// A variable can contain
// string OR number.

let value: string | number;

value = "Hello";

value = 100;

console.log(value);


// Function using union

function printId(id: string | number): void {

    console.log(`ID: ${id}`);

}

printId(101);

printId("USER101");


// ==========================================
// 4. UNION WITH TYPE CHECKING
// ==========================================

function processValue(
    value: string | number
): void {

    if (typeof value === "string") {

        console.log(
            value.toUpperCase()
        );

    } else {

        console.log(
            value.toFixed(2)
        );

    }

}

processValue("hello");

processValue(25);


// ==========================================
// 5. INTERSECTION TYPES
// ==========================================

type Person = {

    name: string;
    age: number;

};


type Employee = {

    employeeId: number;
    department: string;

};


// Intersection means:
// Person AND Employee

type EmployeePerson = Person & Employee;


const employee: EmployeePerson = {

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

let direction:
    "left" |
    "right" |
    "up" |
    "down";


direction = "left";

console.log(direction);


// This would produce an error:

// direction = "hello";


// ==========================================
// LITERAL TYPE WITH FUNCTION
// ==========================================

function move(
    direction: "left" | "right"
): void {

    console.log(
        `Moving ${direction}`
    );

}

move("left");

move("right");


// ==========================================
// 7. NULLABLE TYPES
// ==========================================

let username: string | null;

username = "Simon";

username = null;

console.log(username);


// ==========================================
// 8. NULLABLE FUNCTION PARAMETER
// ==========================================

function printUsername(
    username: string | null
): void {

    if (username === null) {

        console.log("No username");

    } else {

        console.log(
            `Username: ${username}`
        );

    }

}

printUsername("Simon");

printUsername(null);


// ==========================================
// 9. OPTIONAL CHAINING
// ==========================================

type User = {

    name: string;

    address?: {

        city: string;

    };

};


const user: User = {

    name: "Simon"

};


// Without optional chaining:
//
// console.log(user.address.city);
//
// This can cause an error because
// address may not exist.


// With optional chaining:

console.log(
    user.address?.city
);


// ==========================================
// 10. NULLISH COALESCING
// ==========================================

const city =
    user.address?.city ?? "Unknown";

console.log(city);
export {};


// ==========================================
// 11. COMBINING EVERYTHING
// ==========================================

type Account = {

    id: string | number;

    username: string;

    role:
        "admin" |
        "user" |
        "guest";

    email: string | null;

    address?: {

        city: string;

        country: string;

    };

};


const account: Account = {

    id: 101,

    username: "Simon",

    role: "user",

    email: null

};


console.log(account.username);

console.log(account.role);

console.log(account.email);

console.log(
    account.address?.city ?? "No city"
);