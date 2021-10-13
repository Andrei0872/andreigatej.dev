---
title: "Haskell Notes"
slug: /my-dev-notes/haskell-notes
parent: "Dev Notes"
date: 2021-10-05
isArticleSample: false
---

- [Getting Started](#getting-started)
- [Exercises](#exercises)
  - [A function that returns the sum of the squares of 2 numbers](#a-function-that-returns-the-sum-of-the-squares-of-2-numbers)
  - [Check if a number is even](#check-if-a-number-is-even)
  - [Function that returns the factorial of a number](#function-that-returns-the-factorial-of-a-number)
  - [Take the last `N` elements from a list](#take-the-last-n-elements-from-a-list)
  - [Remove an element from a list at a given position](#remove-an-element-from-a-list-at-a-given-position)
  - [Create a list of `N` elements filled with a value `V`](#create-a-list-of-n-elements-filled-with-a-value-v)

## Getting Started

*It is assumed the VS Code editor is used.*

Start off with installing the compiler and other necessary/useful stuff from [here](https://www.haskell.org/ghcup/).

Install the *haskell extension* in VS Code.

*If you're getting errors like `the compiler is missing`, try closing the current VS Code window and open a new one.*

Once everything is installed, you can run the compiler *interactively*, by using the `ghci` command.

A few commands that come handy when using `ghci`:

* `:r` - reload the currently loaded file
* `:l foo.hs` - load the `foo.hs` file
* `:t entity` - get the `entity`'s type
* `:m` - return to the initial stage(e.g `Prelude`)
  ```bash
  # Assuming a file has been loaded.
  *Main> import Data.List
  *Main Data.List> :m - Data.List 
  ```

---

## Exercises

### A function that returns the sum of the squares of 2 numbers

```haskell
sumSquares x y = x**2 + y**2
```

### Check if a number is even

```hs
isEven :: Integer -> String
isEven x =
  if even x
    then "even"
  else "odd"
```

```hs
isEven x
  | even x = "even"
  | not (even x) = "odd"
  | otherwise = "odd"
```

### Function that returns the factorial of a number

```hs
fact n =
  if n == 0
    then 1
  else n * fact(n-1)
```

```hs
factorial x
  | x == 0 = 1
  | x > 0 = x * factorial (x - 1)
  | otherwise = error "the input can't be negative!"
```

---

### Take the last `N` elements from a list

```hs
takeFinal :: [a] -> Int -> [a]
takeFinal l n =
  if length l < n
    then l
  else
    drop (length l - n) l
```

---

### Remove an element from a list at a given position

```hs
remove :: [a] -> Int -> [a]
remove l pos = take pos l ++ drop (pos + 1) l
```

---

### Create a list of `N` elements filled with a value `V`

```hs
myreplicate :: Int -> a -> [a]
myreplicate 0 _ = []
-- x : ls -> [x, ...ls]
myreplicate n v = v : myreplicate (n -1) v
```