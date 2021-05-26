---
title: "C++ Notes"
slug: /my-dev-notes/cpp-notes
parent: "Dev Notes"
date: 2021-02-22
---

- [Pointer & References](#pointer--references)
  - [passing by pointer:](#passing-by-pointer)
  - [arrays are in fact **pointers**:](#arrays-are-in-fact-pointers)
  - [arrays of pointers:](#arrays-of-pointers)
- [The `const` keyword](#the-const-keyword)
  - [the `const` keyword in classes](#the-const-keyword-in-classes)
- [Classes](#classes)
  - [access modifiers](#access-modifiers)
  - [constructors](#constructors)
  - [references in class](#references-in-class)
  - [destructors](#destructors)
  - [polymorphism & the `virtual` keyword](#polymorphism--the-virtual-keyword)
- [inheritance](#inheritance)
  - [both base classes have the same method](#both-base-classes-have-the-same-method)
  - [the diamond problem](#the-diamond-problem)
- [*Constness*](#constness)
  - [Basic notions](#basic-notions)
  - [Casting away the `constness`](#casting-away-the-constness)
  - [`const` when using parameters](#const-when-using-parameters)
  - [`const` functions and overloading](#const-functions-and-overloading)
  - [The `mutable` keyword](#the-mutable-keyword)
- [Compiler generated functions](#compiler-generated-functions)
  - [Copy constructor](#copy-constructor)
  - [Copy assignment operator](#copy-assignment-operator)
  - [Destructor](#destructor)
  - [Virtual destructors and smart destructor](#virtual-destructors-and-smart-destructor)
- [Covariance](#covariance)
- [Implicit type conversions](#implicit-type-conversions)


<details>
  <summary>Resources</summary>

  <p>
    <ul>
      <li>https://www.youtube.com/watch?v=7arYbAhu0aw&list=PLE28375D4AC946CC3</li>
    </ul>
  </p>
</details>

## Pointer & References

* the **value** that a pointer holds is that **address of the thing it points to**
  * `*ptr` = the **value** at the address the pointer points to

* `int& ref = foo`: `ref` is the **same** as `foo`; in other words, it gives you a new way to call a location in memory

```cpp
#include<iostream>

using namespace std;

int main () {
  int x = 19;
  
  int *p = &x;
  int *q = &x;

  *p = 7;

  int &y = x;

  // 7 7 7
  // cout << *p << " " << *q << " " << x;

  x = 123;
  // 123 123
  cout << y << " " << x << '\n';

  y = 999;
  // 999 999 999
  cout << y << " " << x << " " << *p << '\n';
}
```

### passing by pointer:

```cpp
  void ptrExample (int *p) {
  *p = 4;

  (*p)++;
}

int main () {
  int x = 19;

  // a pointer's value is just an address
  ptrExample(&x);

  cout << x << "\n"; // 5
}
```

### arrays are in fact **pointers**:

```cpp
int main () {
  int a[] = {1,2,3};

  int *p = &a[1];

  cout << p[0] << '\n';
  cout << *(p + 1) << '\n';
  cout << *(p - 1) << '\n';

  int x = 123;
  int *p2 = &x;

  cout << *(p2 + 0) << '\n';
}
```

### arrays of pointers:

```cpp
int main () {
  int a1 = 1;
  int a2 = 2;
  int* a[] = {&a1,&a2};


  cout << **a << '\n'; // 1
  cout << *(*a + 1) << '\n'; // 2

  // the addresses are sequential
  // cout << a[0] << '\n';
  // cout << a[1] << '\n';

  cout << *a[1] << '\n'; // 3
}
```

---

## The `const` keyword

```cpp
int main () {
  const int MAX_AGE = 19;
  
  // can't change it, since it is a const
  // MAX_AGE = 123;

  int* a = new int;
  // some explicit conversion
  a = (int*)&MAX_AGE;
  cout << *a << '\n'; // 19

  const int* b = new int;
  // can't change the value like this
  // *b = 10;
  // this is valid
  b = &MAX_AGE;

  int* const c = new int;
  // this is valid
  *c = 10;
  // NOT valid
  // c = &MAX_AGE;

  const int* const d = new int;
  // neither of these are valid
  // *d = 10;
  // d = &MAX_AGE;
}
```

### the `const` keyword in classes

```cpp
class Foo {
  private:
    int x = 10, y = 20;
    // `bypassing` the `const` keyword
    int mutable z = 30;

  public:
    int getX () const {
      // the `const` keyword ensure that inside the method nothing is altered
      // y = 100;
      // x = 100;

      z++;

      // on a side note, if another method were to be called in this method's body
      // that method must be a const method as well

      return x;
    }
};

int main () {
  Foo foo;

  cout << foo.getX() << '\n'; // 10
}
```

---

## Classes

### access modifiers

```cpp
class Foo {
  // **** by default
  int x, y;

  public:
    int z = 10;
};

int main () {
  Foo f;

  // only `z` is accessible
  cout << f.z << '\n';
}
```

### constructors

```cpp
class Foo {
  int x,y;
  string z;
  
  public:
    Foo() {}
    Foo(int a, int b):x{a}, y{b}, z{"default value"} {}

    int getX() const { return x; }
    int getY() const { return y; }
    string getZ() const { return z; }
};

int main () {
  Foo f(10,20);

  cout << f.getX() << '\n'; // 10
  cout << f.getY() << '\n'; // 20
  cout << f.getZ() << '\n'; // 'default value'
}
```

* how do you initialize **constant**/**other class** members ?

```cpp
class Base {
  const int myAge;
  
  public:
    Base(int num): myAge(num) { /* you can also have initialization logic here */ }

    int getMyAge () const {
      return myAge;
    }
};

int main () {
  Base b(19);

  cout << b.getMyAge() << '\n';
}
```

* dealing with constructors while also using inheritance

```cpp

class Base {
  protected:
    string name;

  public:
    Base(string n): name(n) {}
};

class Derived : public Base {
  int age;

  public:
    Derived(int a, string name): Base(name), age(a) {}

    void getInfo () {
      cout << age << " ; " << name << "\n";
    }
};

int main () {
  Derived d(19, "andrei");

  d.getInfo(); // '19 ; andrei'
}
```

### references in class

```cpp
class Foo {
  string testVar = "andrei";
  string &name = testVar;
};

int main () {
  Foo f;
  Foo g;

  // the properties will be copied **member by member**
  // and the reference can be paired with only one variable
  // g = f;
}
```

### destructors

```cpp
class Dog {
  public:
    Dog () {
      cout << "Dog init" << '\n';
    }
    ~Dog () {
      cout << "Dog destr" << '\n';
    }
};

class Yuri : public Dog {
  public:
    Yuri () {
      cout << "Yuri init" << '\n';
    }
    ~Yuri () {
      cout << "Yuri destr" << '\n';
    }
};

int main () {
  Yuri y;

  /* output:
  Dog init
  Yuri init
  Yuri destr
  Dog destr
  */
}
```

### polymorphism & the `virtual` keyword

```cpp
class Dog {
  public:
    virtual void bark () {
      cout << "Dog barking" << '\n';
    }

    void seeCat () { bark(); }
};

class Yuri : public Dog {
  public:
    virtual void bark () {
      cout << "Yuri is barking" << '\n';
    }
};

int main () {
  Yuri y;

  // Yuri is barking
  y.seeCat();

  // without the `virtual` keyword inside `Dog` class: : "Dog barking"
}
```

## inheritance

* *interface* inheritance:
  * subtyping(a subtype can be used in the context where the base type is expected)
  * polymorphism
* *implementation* inheritance
  * increases code complexity
  * *base classes* should be thin

### both base classes have the same method

```cpp
class IFile {
  public:
    void read(string name) { }
};

class OFile {
  public:
  void read(string name) { }
};

class File : public IFile, public OFile {

};

int main () {
  File f;
  
  // invalid: it is ambiguous
  // f.read("a file name");


  f.IFile::read("a-file-name");
  f.OFile::read("another file name");
}
```

### the diamond problem

```cpp
class File {
  public:
    string name;
    void read () {}
};

class IFile : virtual public File {
};

class OFile : virtual public File
{
};

class IOFile : public IFile, public OFile {

};

int main () {
  IOFile f;

  // without `virtual public File` phrases
  // this would be invalid
  f.read();
}
```

---


## *Constness*

### Basic notions

```cpp
// `const` - a **compile time** contraint that an object can't be modified
const int v = 10;
// v = 20; // Error

// The data is const, the pointer is not
const int* p = &v;
int a = 100;
// p++; // OK
// p = &a; // OK - modified `p` itself, not the data
// *p = 500; // Error

// The pointer is const, the data is not
// int* const p2;

// Both data and pointer are const
// const int* const p3;
//* TAKEAWAY: in order to determine what is `const`, just read what
//* follows the `const` keyword
//* if `const` is on the left of `*`, the data is const
//* if `const` is on the right of `*`, the pointer is const
```

### Casting away the `constness`

```cpp
// Casting away the _constness_
const int value = 19;
const_cast<int&>(value) = 100;

// Changing the type of the variable
int x;
// static_cast<const int&>(x) = 100; // error: assignment of read-only location ‘x’
```

### `const` when using parameters

```cpp
void increment (const int& v) {
  // Allowed with `int& v`
  // NOT allowed with `const int& v`
  // v++;
}

// `const` when using parameters
int age = 20;
increment(age);
```

### `const` functions and overloading

```cpp
class Person {
  private:
    string name;
  
  public:
    Person () {
      name = "Andrei";
    }

    // With `const string` it will return a copy
    const string& getName () {
      return name;
    }

    void printName () const {
      cout << "CONST: " << name << '\n';

      // Can't call the function if it's not `const` too
      // getName();
    }
    // Overloading a `const` function
    void printName () {
      cout << "NON-CONST: " << name << '\n';
    }

int main () {
  Person pers;
  const string& name = pers.getName();
  // name += "tst"; // Error

  Person pers1;
  pers1.printName(); // NON-CONST printed

  const Person pers2;
  pers2.printName(); // CONST printed

  // pers1 = pers2; // OK
  // pers2 = pers1; // Error: `pers2` is const
}
};
```

### The `mutable` keyword

```cpp
class Stack {
  private:
    int idx = 0;
    mutable vector<int> items;

    int *v2;
  
  public:
    Stack () {}

    // Might not be the logical best case where `const` could be used
    void add (const int& item) const {
      // Solved with `mutable`
      items.push_back(item);

      const_cast<Stack*>(this)->idx++;

      // It doesn't change the member directly
      v2[0] = item;
    }
};

int main () {
  Stack st;
  st.add(1);
  st.add(2);
  st.add(3);
}
```

---

## Compiler generated functions

* `const` & **reference** - can't be copied, can only be initialized
* all the compiler generated functions are inline
* a compiler generated default constructor will call the data members' constructor

### Copy constructor

* it does a **shallow copy**
* it is also *implicit*: it is invoked when an object is passed as an argument to a function or when it is returned from a function

```cpp
// Member by member initialization
ClassName(const ClassName& rhs) {};

// Disabling it - this, or add it as `private`
ClassName(const ClassName& rhs) = delete;

int main () {
  ClassName c1;

  ClassName c2(c1);
}
```

### Copy assignment operator

```cpp
// Will copy all the members from `rhs` to the current class
ClassName& operator=(const ClassName& rhs) {}; // Member by member copying
```

### Destructor

* a class with a private destructor can only be stored on heap, not on stack; that's because when the stack item is removed, the destructor will be called either way

---

### Virtual destructors and smart destructor

```cpp

class Parent {
  public:
    virtual ~Parent () {
      cout << "PARENT DESTR \n";
    }
};

class Child : public Parent {
  public:
    ~Child () {
      cout << "CHILD DESTR \n";
    }
};

int main () {
  // Output: `PARENT DESTR` (without virtual ~Parent())
  /*
  Output: 
    CHILD DESTR
    PARENT DESTR
  
  (with virtual ~Parent())
  */
  // Parent* p = new Child();
  // delete p;

  shared_ptr<Parent> p = shared_ptr<Child>(new Child());
  /*
  Output:
    CHILD DESTR
    PARENT DESTR
  */
}
```

---

## Covariance

```cpp
class Base {
  public:
    Base () {
      cout << "BASE \n";
    }

    virtual void sayHi  () {
      cout << "[BASE]: hi! \n";
    }

    virtual Base* clone () {
      return new Base(*this);
    }
};

class Extended : public Base {
  public:
    Extended () {
      cout << "EXTENDED \n";
    }

    virtual void sayHi  () {
      cout << "[EXTENDED]: hi! \n";
    }

    virtual Extended* clone () {
      return new Extended(*this);
    }
};

void foo (Base* b) {
  // At this point, although `foo` might have been invoked with
  // an `Extended`instance(the `Extended` class extends animal),
  // `b2` is a `Base` instance
  // Base* b2 = new Base(*b);
  // b2->sayHi(); // Output: `[BASE]: hi!`

  // Covariance - it allows an overriden method(virtual function)
  // to have a different return type as long as that return type
  // is derived from the base class' return type
  Base* b2 = b->clone();
  b2->sayHi(); // Output: `[EXTENDED]: hi!`
}

int main () {
  // Bar bar1("bar1 var");
  // Bar bar2("bar2 var");

  // bar1 = bar2;
  // cout << bar1.barVar;

  Extended e;
  foo(&e);
}
```

---

## Implicit type conversions

```cpp
class Test {
  private:
    string name;
  
  public:
    // This is not only a constructor, but also a type converter.
    // The type conversion is _implicit_ by default.
    // What this means is that it will convert the `string` to a `Test` instance.
    /* explicit */ Test(string name): name(name) {}
    
    // Providing a custom type conversion from `string`
    // Test(const string& name) {}

    // Providing an implicit conversion operator
    // So that when you do `string(testInstance)`, it will invoke the function below.
    operator string () const {
      return name;
    }

    const string& getName () const {
      return name;
    }
};

// Nonmember operator so that it covers all cases
const Test operator+(const Test& lhs, const Test& rhs) {
  return Test(lhs.getName() + " " + rhs.getName());
}

int main () {
  string testName = "Andrei";

  // It works without the `explicit` keyword.
  Test t1 = testName;

  // It works because we've provided the custom conversion to `string`
  cout << "My name is: " + string(t1) << '\n';
  string myName = t1;
  cout << myName << '\n'; // Output: `Andrei`


  Test t2("Andrei");
  Test t3("Gatej");
  cout << (t2 + t3).getName() << '\n'; // Output: `Andrei Gatej`
  cout << (t3 + t2).getName() << '\n'; // Output: `Gatej Andrei`
}
```