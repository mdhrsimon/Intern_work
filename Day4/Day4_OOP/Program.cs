using System;
using System.Collections.Generic;
using System.Linq;
//=========================================================
// Program1: Inheritance
//=========================================================

//Single Inheritance
/*
class Animal


{
    public void Eat()
    {
        Console.WriteLine("Animal is eating");
    }
}

class Dog : Animal
{
    public void Bark()
    {
        Console.WriteLine("Dog is barking");
    }
}
*/

//Multilevel
/*
class Animal
{
    public void eat()
    {
        Console.WriteLine("Is eating.");
    }
}
class Dog : Animal
{
    public void bark()
    {
        Console.WriteLine("Is Barking.");
    }
}
class Cat:Dog
{
    public void meow()
    {
        Console.WriteLine("Is meowing.");
    }
}
*/

//Hierarchial Inheritance
/*
class Animal
{
    public void eat()
    {
        Console.WriteLine("Is eating.");
    }
}
class Dog : Animal
{
    public void bark()
    {
        Console.WriteLine("Is Barking.");
    }
}
class Cat : Animal
{
    public void meow()
    {
        Console.WriteLine("Is meowing.");
    }
}
*/
//=========================================================
// Program2: Abstract Class
//=========================================================
/*
abstract class Vehicle
{
    public void start()
    {
        Console.WriteLine("Vehicle Started.");
    }
    public abstract void Move();
}
class Car:Vehicle
{
    public override void Move()
    {
        Console.WriteLine("Drive.");
    }
}
class Boat:Vehicle
{
    public override void Move()
    {
        Console.WriteLine("sail.");
    }
        

    
}

*/

//=========================================================
// Program3: Polymorphism
//=========================================================
/*
class Vehicle
{
    public virtual void Go()
    {
        Console.WriteLine("Vehicle moves");
    }
}

class Car : Vehicle
{
    public override void Go()
    {
        Console.WriteLine("Car is driving");
    }
}

class Bicycle : Vehicle
{
    public override void Go()
    {
        Console.WriteLine("Bicycle is riding");
    }
}

class Boat : Vehicle
{
    public override void Go()
    {
        Console.WriteLine("Boat is sailing");
    }
}
*/
//=========================================================
// Program4: Interface
//=========================================================
/*
interface IVehicle
{
    public void Go();
    
}
interface Istart
{
    public void start();

}

class Car : IVehicle
{
    public void Go()
    {
        Console.WriteLine("Car is driving");
    }
}

class Bicycle : IVehicle, Istart
{
    public void Go()
    {
        Console.WriteLine("Bicycle is riding");
    }
    public void start()
    {
        Console.WriteLine("Bicycle is started");
    }

}

class Boat : IVehicle
{
    public void Go()
    {
        Console.WriteLine("Boat is sailing");
    }
}
*/
//=========================================================
// Program5: Lists,queue,stack,dictionary
//=========================================================




//class Program
//{
//    static void Main(string[] args)
//    {
//        int[] num = new int[3];
//        num[0] = 10;
//        num[1] = 20;
//        num[2] = 30;
//        Console.WriteLine(num[0]);
//    }
//}


//List
//List<int> num = new List<int>();

//num.Add(10);
//num.Add(20);
//num.Add(30);

//foreach (int n in num)
//{
//    Console.WriteLine(n);
//}

//Dcitionary
//Dictionary <int,String> num = new Dictionary<int, String>();

//num.Add(101,"Simon");
//num.Add(102,"Arti");

//Console.WriteLine(num[101]);
//Queue
//Queue<int> num = new Queue<int>();

//num.Enqueue(101);
//num.Enqueue(102);
//num.Enqueue(103);


//Console.WriteLine(num.Dequeue());

//Stack
//Stack<int> num = new Stack<int>();

//num.Push(101);
//num.Push(102);
//num.Push(103);


//Console.WriteLine(num.Pop());

//=========================================================
// Program6: Generic
//=========================================================
/*
class Calculator<T>
    {
        public void Display(T value)
        {
            Console.WriteLine(value);
        }
    }

    class Program
    {
        static void Main()
        {
        Calculator<int> cal = new Calculator<int>();
        cal.Display(100);
        


        Calculator<String> cal1 = new Calculator<String>();
        cal1.Display("Simon");
    }
}
//=========================================================
// Program7: LINQ
//=========================================================
*/
//class Program
//{
//    static void Main(string[] args)
//    {
//        List<int> numbers = new List<int>()
//        {
//            1, 3, 5, 8, 10, 12
//        };
//        var result = numbers.Where(number => number > 5);
//        foreach(int num in result)
//        {
//            Console.WriteLine(num);
//        }

//    }
//}







