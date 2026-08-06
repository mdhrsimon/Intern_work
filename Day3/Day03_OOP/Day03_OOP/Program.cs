using System;
using System.Security.Cryptography;
namespace Day03_OOP
{
    class Program

    {
        //=========================================
        // Program 1: Method 
        //=========================================

        //static void Wish(String name)
        //{
        //    Console.WriteLine("Happy New year " + name);
        //}


        /*
        static void OddEven(int num)
        {
            if(num%2 == 0)
            {
                Console.WriteLine("Even");
            }
            else
            {
                Console.WriteLine("odd");
            }
        }
        static void Main(string[] args)
        {
            //String name = "Simon";
            //Wish(name);
            Console.WriteLine("Enter a number:");
            int n1= Convert.ToInt32(Console.ReadLine());
            OddEven(n1);
        }
        */
        //static void Main(string[] args)
        //{
        //=========================================
        // Program 2: Method Overloading
        //=========================================

        //same name but unique signature(name+parameter)
        /*
        int sum;
        sum=add(2, 3,1);
        Console.WriteLine("Sum:"+sum);

    }
    static int add(int a, int b)
    {
        return a + b;
    }
    static int add(int a, int b, int c)
    {
        return a + b+c;
    }
    static Double add(Double a, int b)
    {
        return a + b ;
    }
        */

        //=========================================
        // Program 3: Param Keyword
        //=========================================
        //allows a method to accept a variable number of arguments of the same data type
        /*
        double lists;
        lists= Checkout(3.21, 431.6, 5.78);
        Console.WriteLine(lists);


    }      
    static double Checkout(params double[] prices)
    {
        double total = 0;
        foreach(double price in prices)
        {
                total += price;
        }

        return total;
        //=========================================
        // Program 4:Class and Object
        //=========================================

    }
        */

        //    static void Main(string[] args)
        //    {
        //        Message.Wish();
        //    }
        //}


        //static class Message
        //{
        //    public static void Wish()
        //    {
        //        Console.WriteLine("GoodMorning.");

        //    }
        //}
        /*

        static void Main(string[] args)
        {
            add a = new add();
            a.sum(2, 3);

        }
    }
    class add
    {
        public void sum(int a, int b)
        {
            int total= a + b;
            Console.WriteLine("Sum:" + total);

        }
        
    }
        */

        //=========================================
        // Program6:Static
        //=========================================
        //same name as the class name
        /*
        static void Main(string[] args)
        {

            Human h1 = new Human("Simon");
            Human h2= new Human("Diana");
            Human h3= new Human("Aisha");

            Console.WriteLine(Human.numOfNName);
        }
    }
    class Human
    {
        public string name;
        public static int numOfNName;

        public Human(String name)
        {
            this.name = name;
            numOfNName++;

        }
        */
        /*
        static void Main(string[] args)
        {
            Pizza p1= new Pizza("Chicken","Tomato","Pineapple");
            Pizza p2= new Pizza("Chicken","Tomato");

            p1.Display();
            p2.Display();
            
        }

        

    }
    class Pizza
    {
        String type;
        String sauce;
        String toppings;
        public Pizza(String type, String sauce, String toppings)
        {
            this.type = type;
            this.sauce = sauce;
            this.toppings = toppings;
            
        }
        public Pizza(String type, String sauce)
        {
            this.type = type;
            this.sauce = sauce;
           

        }
        public void Display()
        {
            Console.WriteLine("Type: " + type);
            Console.WriteLine("Sauce: " + sauce);
            Console.WriteLine("Toppings: " + toppings);

        }
        */



    }
}
