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
  - [Sum the lengths of the words which start with `A` form a given list](#sum-the-lengths-of-the-words-which-start-with-a-form-a-given-list)
  - [Count the number of vocals of palindromes words](#count-the-number-of-vocals-of-palindromes-words)
  - [Add a number `v` after all even numbers from a given list](#add-a-number-v-after-all-even-numbers-from-a-given-list)
  - [Given a list, return a new list where each element is a list of corresponding divisors](#given-a-list-return-a-new-list-where-each-element-is-a-list-of-corresponding-divisors)
  - [Given the upper and lower bound of an interval and a list, print the list's elements which belong to that interval](#given-the-upper-and-lower-bound-of-an-interval-and-a-list-print-the-lists-elements-which-belong-to-that-interval)
  - [Select the positive numbers from the list](#select-the-positive-numbers-from-the-list)
  - [Given a list of integers, return a list of indices, where each index corresponds to an odd number](#given-a-list-of-integers-return-a-list-of-indices-where-each-index-corresponds-to-an-odd-number)
  - [Compute the product of all digits from a given string](#compute-the-product-of-all-digits-from-a-given-string)
  - [Custom implementation of `zip`](#custom-implementation-of-zip)
  - [Check if a list is ordered based on a custom operation](#check-if-a-list-is-ordered-based-on-a-custom-operation)
  - [Creating a custom right-associative operator](#creating-a-custom-right-associative-operator)
  - [Compose a function `fn` with list of functions and then apply all the functions on a value](#compose-a-function-fn-with-list-of-functions-and-then-apply-all-the-functions-on-a-value)
  - [Examples with the `map` function](#examples-with-the-map-function)
  - [Custom implementation of `filter` and `map`](#custom-implementation-of-filter-and-map)

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

### Take the last `N` elements from a list

```hs
takeFinal :: [a] -> Int -> [a]
takeFinal l n =
  if length l < n
    then l
  else
    drop (length l - n) l
```

### Remove an element from a list at a given position

```hs
remove :: [a] -> Int -> [a]
remove l pos = take pos l ++ drop (pos + 1) l
```

### Create a list of `N` elements filled with a value `V`

```hs
myreplicate :: Int -> a -> [a]
myreplicate 0 _ = []
-- x : ls -> [x, ...ls]
myreplicate n v = v : myreplicate (n -1) v
```

### Sum the lengths of the words which start with `A` form a given list

```hs
totalLen :: [String] -> Int
totalLen [] = 0
totalLen (word : restOfWords)
  | word == "" = totalLen restOfWords
  | head word == 'A' = length word + totalLen restOfWords
  | otherwise = totalLen restOfWords
```

### Count the number of vocals of palindromes words

```hs
nrVocals :: [[Char]] -> Int
nrVocals [] = 0
nrVocals (c : lc) = (if isPalindrom c then nrVocC c else 0) + nrVocals lc
  where
    isPalindrom x = x == reverse x
    vocals = "aeiouAEIOU"
    nrVocC "" = 0
    nrVocC (l : cuv) = (if l `elem` vocals then 1 else 0) + nrVocC cuv
```

### Add a number `v` after all even numbers from a given list

```hs
addNumToList :: Integer -> [Integer] -> [Integer]
addNumToList el [] = []
addNumToList el (crtElem : restOfElements) = (if even crtElem then [crtElem, el] else [crtElem]) ++ addNumToList el restOfElements
```

### Given a list, return a new list where each element is a list of corresponding divisors

```hs
divisors n = [d | d <- [1..n], n `mod` d == 0]
listDivisors = map divisors
```

### Given the upper and lower bound of an interval and a list, print the list's elements which belong to that interval

```hs
inIntervalRec inf sup [] = []
inIntervalRec inf sup (crt:rest) = if crt `elem` interval then crt : inIntervalRec inf sup rest else inIntervalRec inf sup rest
  where interval = [inf..sup]
```

### Select the positive numbers from the list

```hs
pozitiveComp ls = sum [1 | x <- ls, x > 0]
```

### Given a list of integers, return a list of indices, where each index corresponds to an odd number

```hs
pozitiiImpareComp ls = [snd pair | let len = length ls, pair <- zip ls [0 .. len - 1], odd (fst pair)]
```

### Compute the product of all digits from a given string

```hs
multDigitsComp str = if length resultingList == 0 then 1 else product resultingList where
  resultingList  = [digitToInt ch | ch <- str, isDigit ch]
```

### Custom implementation of `zip`

```hs
myzip3 l1 l2 l3 = [(l1 !! idx, l2 !! idx, l3 !! idx) | let minimumLen = minimum (map length [l1, l2, l3]), idx <- [0 .. minimumLen - 1]]

-- myzip3 [1,2,3] [1,2] [1,2,3,4] == [(1,1,1),(2,2,2)]
```

### Check if a list is ordered based on a custom operation

```hs
isOrdered :: [a] -> (a -> a -> Bool) -> Bool
isOrdered [] _ = True
isOrdered (crt : restOfElements) op = and [op crt r | r <- restOfElements] && isOrdered restOfElements op
```

### Creating a custom right-associative operator

```hs
infixr 6 *<*
(*<*) :: (Integer, Integer) -> (Integer, Integer) -> Bool
(*<*) (x1, y1) (x2, y2) = x1 /= x2 && y1 /= y2
```

### Compose a function `fn` with list of functions and then apply all the functions on a value

```hs
composeList :: (b -> c) -> [(a -> b)] -> [(a -> c)]
composeList fn = map(fn.)

applyList :: a -> [(a -> b)] -> [b]
applyList elem = map(\fn -> fn elem)

-- applyList 9 (composeList (+1) [sqrt, (^2), (/2)])
-- [4.0,82.0,5.5]
```

### Examples with the `map` function

```hs
firstEl :: [(b1, b2)] -> [b1]
firstEl = map fst

sumList :: [[Int]] -> [Int]
sumList = map sum

prel2 :: [Int] -> [Int]
prel2 = map (\x -> if even x then x `div` 2 else x * 2)

hasCh :: Char -> [String] -> [String]
hasCh ch = filter (elem ch)

squareOdds :: [Int] -> [Int]
squareOdds = map (^2) . filter odd

onlyVocals :: [String] -> [String]
onlyVocals = map(filter(\ch -> toLower ch `elem` "aeiou"))
```

### Custom implementation of `filter` and `map`

```hs
myMap :: (t -> a) -> [t] -> [a]
myMap _ [] = []
myMap fn (x:rest) = fn x : myMap fn rest

myFilter :: (a -> Bool) -> [a] -> [a]
myFilter _ [] = []
myFilter fn (x:rest) = if fn x then x : myFilter fn rest else myFilter fn rest
```