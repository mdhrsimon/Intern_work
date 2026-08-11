// ==========================================
// TYPESCRIPT OBJECTS
// ==========================================

// ==========================================
// 1. OBJECT WITH TYPES
// ==========================================

const student: {

    name: string;
    age: number;
    course: string;

} = {

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

const user: {

    name: string;
    age: number;
    city?: string;

} = {

    name: "Simon",
    age: 22

};

console.log(user);


// ==========================================
// 4. NESTED OBJECT
// ==========================================

const person: {

    name: string;

    address: {

        city: string;
        country: string;

    };

} = {

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

const students: {

    name: string;
    age: number;

}[] = [

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



const { name, age } = studentData;

console.log(name);
console.log(age);
export {};


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