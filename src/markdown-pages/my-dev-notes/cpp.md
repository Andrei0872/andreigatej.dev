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