using System;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace Day02_Basics
{
    class Program
    {
        static void Main(string[] args)
        {
            // ==========================================
            //              Program 1: User input
            // ==========================================

            /*
            Console.Write("Enter your name: ");
            string name = Console.ReadLine();

            Console.Write("Enter your age: ");
            int age = Convert.ToInt32(Console.ReadLine());

            Console.WriteLine("Goodmorning " + name);
            Console.WriteLine("Your age is  " + age);
            */

            //Operator:Arithmetic
            //Logical
            //Comparision
            //Assignemnt


            // ==========================================
            //             Pragram 2: Artmetic Operators
            // ==========================================

            /*
            Console.WriteLine("Enter two numbers:");
            int x = Convert.ToInt32(Console.ReadLine());
            int y = Convert.ToInt32(Console.ReadLine());
            int add=x + y;
            int sub=x - y;

            int mul = x * y;
            double div = x / (double)y;
            int rem = x % y;
            int incre = x++;
            int decre = y--;

            Console.WriteLine("Addition:"+add);
            Console.WriteLine("Subtraction:" + sub);
            Console.WriteLine("Multiplication:" +mul );
            Console.WriteLine("Division:" + div);
            Console.WriteLine("Increment:" + incre); 
            Console.WriteLine("Decrement:" + decre);
            Console.WriteLine("Remainder:" + rem);
            */
            // ==========================================
            //              Program 3:Assignment operator
            // ==========================================

            //int x = 8;
            //x += 1;
            //Console.WriteLine(x);
            // ==========================================
            //              Program 4: Logical Operator
            // ==========================================

            /*
            Console.WriteLine(true && false);
            Console.WriteLine(false && false);
            Console.WriteLine(true && true);

            Console.WriteLine(true && false);
            Console.WriteLine(false && false);

            Console.WriteLine(!true);
            */

            // ==========================================
            //              Program 5:Comparsion operator
            // ==========================================
            /*
            Console.WriteLine(32<45);
            Console.WriteLine(32>=45); //>||=
            Console.WriteLine(32<=45);
            Console.WriteLine(32!=45);
            */

            // ==========================================
            //              Program 6: Math Methods
            // ==========================================


            /*
            double x = 5;
            double y = 5.4;
            double s = -5;
            double a = Math.Pow(x, 3);
            double b = Math.Sqrt(x);
            double c = Math.Abs(s);
            double m = Math.Round(y);
            double n = Math.Ceiling(y);
            double o = Math.Floor(y);


            Console.WriteLine(m);
            Console.WriteLine(n);
            Console.WriteLine(o);
            */


            // ==========================================
            //              Program 7: Hypotenuse
            // ==========================================

            /*
            Console.WriteLine("Enter value of p: ");
            double p = Convert.ToDouble(Console.ReadLine());

            Console.WriteLine("Enter value of b: ");
            double b = Convert.ToDouble(Console.ReadLine());

            double h = Math.Sqrt(Math.Pow(p, 2) + Math.Pow(b, 2));
            Console.WriteLine("Value of h:" + h);
            */



            // ==========================================
            //              Program 8: String Methods
            // ==========================================
            /*
            string name = "Simon";
            String num = "984-7683105";
            //name=name.ToUpper();
            //name=name.ToLower();

            num = num.Replace("-", "");
            name = name.Insert(0, "@");


            Console.WriteLine(name);
            Console.WriteLine(num);
            Console.WriteLine(num.Length);
            Console.WriteLine(num.Substring(0,3));
            */




            //              Control structure


            //              selection(if,if-else,if-else-if-else,swutch,nested if)
            //              Interation(for, while, do while, foreach)
            //              Jump


            // ==========================================
            //          Program 9: Selection structure
            // ==========================================

            //if statements
            /*
            Console.WriteLine("Enter your age: ");
            int age = Convert.ToInt32(Console.ReadLine());

            if (age > 18)
            {
                Console.WriteLine("You're eligible.");
            }
            else if (age < 0)
            {
                Console.WriteLine("Invalid age!");

            }
            else
            {
                Console.WriteLine("You are not eligible.");
            }
            

            Console.WriteLine("Enter your name: ");
            String name = Console.ReadLine();

            if (name !="")
            {
                Console.WriteLine("hello "+name);
            }
            else
            {
                Console.WriteLine("You haven't enter your name.");
            }

            */


            //switch statement
            /*
            Console.WriteLine("Enter two number:");
            int n1= Convert.ToInt32(Console.ReadLine());
            int n2 = Convert.ToInt32(Console.ReadLine());

            Console.WriteLine("Operations");
            Console.WriteLine("1.Add");
            Console.WriteLine("2.Subtract");
            Console.WriteLine("3.Multiply");

            Console.WriteLine("Select a option:");
            int num=Convert.ToInt32(Console.ReadLine());


            switch (num)
            {
                case 1:
                    int sum = n1 + n2;
                    Console.WriteLine("Addition:"+sum);
                    break;

                case 2:
                    int sub = n1 - n2;
                    Console.WriteLine("Subtraction:" + sub);
                    break;

                case 3:
                    int mul = n1 * n2;
                    Console.WriteLine("Multiplication:" + mul);
                    break;

                default:
                    Console.WriteLine("Invalid case.");
                    break;



            }
            */

            // ==========================================
            //              Program 10: Iteration
            // ==========================================

            //while loop = repeat the code while some condition remains true
            /*
            Console.WriteLine("Enter your age:");
            String age = Console.ReadLine();

            
            while (age == "")
            {
                Console.WriteLine("Enter your age:");
                age= Console.ReadLine();
            }
            Console.WriteLine("your age is "+age);
            */



            //for loop= repeat the code for a finite number of times
            /*

            for(int i=10; i>0; i--)
            {
                Console.WriteLine(i);
                Thread.Sleep(1000);

            }
            Console.WriteLine("Happy New year!!!");
            */


            //Nested loops
            /*
            Console.WriteLine("Enter number of rows:");
            int row = Convert.ToInt32(Console.ReadLine());
            Console.WriteLine("Enter number of columns:");
            int col = Convert.ToInt32(Console.ReadLine());

            Console.Write("Enter a symbol:");
            string sym = Console.ReadLine();

            for (int i = 0; i < row; i++)
            {
                for (int j = 0; j < col; j++)
                {
                    Console.Write(sym);
                }
                Console.WriteLine("");
            }
            */

            //array

            //String [] arr = { "Simon", "David", "Riva" };


            //for (int i= 0; i < arr.Length; i++)
            //{
            //    Console.WriteLine(arr[i]);
            //}

            //int arr=new int[5];

            //foreach= iterate through every element in a collection[list,array]
            //          not fexible with the forward,backward pass like in for loop
            /*
            foreach(string arrs in arr)
            {
                Console.WriteLine(arrs);
            }
            */


            // ==========================================
            //        Program 11:Exception Handling
            // ==========================================
            /*
            try
            {
                Console.WriteLine("Enter a number1: ");
            int x = Convert.ToInt32(Console.ReadLine());
            
            Console.WriteLine("Enter a number2: ");
            int y = Convert.ToInt32(Console.ReadLine());

            int result = x / y;
            Console.WriteLine("Result: " + result);
            }
            
            catch (FormatException e)
            {
                Console.WriteLine("Mismatched format.");
            }
            catch (DivideByZeroException e)
            {
                Console.WriteLine("Cannot divide by zero.");
            }
            finally
            {
                Console.WriteLine("Program Completed.");
            }
            */

            















        }

    }
}