// ==========================================
// TYPESCRIPT BASICS
// ==========================================


// ==========================================
// 1. VARIABLES WITH TYPES
// ==========================================

let name: string = "Simon";

let age: number = 22;

let isStudent: boolean = true;

console.log(name);
console.log(age);
console.log(isStudent);
export {};


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

let data: any = "Hello";

data = 100;

data = true;

console.log(data);


// ==========================================
// 4. UNKNOWN
// ==========================================

let unknownValue: unknown = "Hello";

if (typeof unknownValue === "string") {

    console.log(unknownValue.toUpperCase());

}


// ==========================================
// 5. VOID
// ==========================================

function sayHello(): void {

    console.log("Hello");

}

sayHello();


// ==========================================
// 6. NEVER
// ==========================================

// A function that never finishes normally.

function throwError(message: string): never {

    throw new Error(message);

}

// throwError("Something went wrong");


// ==========================================
// 7. TYPE ASSERTION
// ==========================================

let someValue: unknown = "Hello TypeScript";

let stringValue = someValue as string;

console.log(stringValue.length);


// ==========================================
// 8. UNION BASIC
// ==========================================

let id: string | number;

id = 100;

id = "ABC123";

console.log(id);