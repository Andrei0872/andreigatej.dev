---
title: "C Notes"
slug: /my-dev-notes/c-notes
parent: "Dev Notes"
date: 2021-10-13
---

- [Custom implementation of `cp`](#custom-implementation-of-cp)
- [Create a child process that will print the items in the current working directory](#create-a-child-process-that-will-print-the-items-in-the-current-working-directory)
- [For some given numbers, print the Collatz sequence for each number using child processes](#for-some-given-numbers-print-the-collatz-sequence-for-each-number-using-child-processes)
- [Using threads - matrix multiplication](#using-threads---matrix-multiplication)

## Custom implementation of `cp`

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>

int main (int nrArgs, char* args[]) {
  if (nrArgs != 3) {
    char const* errMsg = "Both and only src and dest are required!";
    printf("%s", errMsg);

    return 1;
  }

  const char* src = args[1];
  const char* dest = args[2];

  int srcFD = open(src, O_RDONLY);
  if (srcFD < 0) {
    printf("An error occurred while opening the `src` file");
    return errno;
  }

  // r w e
  // 4 2 1
  int destFD = open(dest, O_CREAT | O_WRONLY, 0666);

  // Stack allocation
  // char crtChar[4096];

  // Heap allocation
  // 4096 could be replaced with page size value
  char* crtChar = (char*) malloc(4096);

  int readStat;
  // When `readStat == 0`, it means that EOF has been reached.
  while (readStat = read(srcFD, crtChar, 4096)) {
    if (readStat < 0) {
      printf("An error occurred while reading the `src` file");
      return errno;
    }

    // `readStat` contains how many bytes have been read.
    write(destFD, crtChar, readStat);
  };

  free(crtChar);

  close(srcFD);
  close(destFD);
  return 0;
}
```

Usage:

```bash
gcc mycp.cpp -o mycp
./mycp foo bar
```


---

## Create a child process that will print the items in the current working directory

```cpp
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <sys/wait.h>

int main () {
  printf("Parent process ID: %d\n", getpid());
  printf("Child process ID: %d\n", getppid());

  pid_t pid = fork();
  if (pid < 0) {
    return errno;
  }
  else if (pid == 0) {
    char* args[] = {"ls", NULL};
    execve("/usr/bin/ls", args, NULL);
    perror(NULL);
  } else {
    int parentProcessStatus;
    pid_t p = wait(&parentProcessStatus);
    if (p < 1) {
      return errno;
    }

    printf("The process created from 'ls' has ended with status: %d", parentProcessStatus);
  }
}
```

---

## For some given numbers, print the Collatz sequence for each number using child processes

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <sys/wait.h>
#include <unistd.h>

int main (int argc, char* args[]) {
  for (int i = 1; i < argc; i++) {
    int collatsArg = atoi(args[i]);

    pid_t pid = fork();
    if (pid < 0) {
      return errno;
    } else if (pid == 0) {
      printf("Child with ID %d\n", getpid());

      char argAsStr[10] = "";
      sprintf(argAsStr, "%d", collatsArg);

      char *args[] = {"c", argAsStr, NULL};
      // `c` - compiled `collatz.c`
      execve("/home/anduser/Documents/learning-os/c", args, NULL);

      perror(NULL);
    } else {
      // Sequential execution.
      // waitpid(pid, NULL, 0);
      // printf("Child process with id %d ready\n", pid);
    

      // It will always be the same
      printf("test %d\n", getpid());
    }
  }

  // If we left it like this, it will only wait for the **first** process
  // that finished its jobs.
  // wait(NULL);

  // We use `wait` in a loop that's dependent on the number of arguments
  // because `nr of child processes = number of arguments`.
  for (int i = 1; i < argc; i++) {
    wait(NULL);
  }
  printf("\n Parent with ID %d ready\n", getppid());
}

// `collatz.c` -> `c` executable 
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main (int argC, char* argv[]) {
  if (argC != 2) {
    printf("2 arguments were expected!");
    return 1;
  }

  printf("In collatz: %d\n", getpid());
  printf("[In collatz] PARENT ID: %d\n", getppid());

  // ? *argv[1] returns something diff
  int num = atoi(argv[1]);
  // int num = *argv[1];
  printf("num %d\n", num);
  do {
    printf("%d ", num);

    num = num % 2 == 0 ? num / 2 : 3 * num + 1;
  } while(num != 1);

  printf("\n");
}
```

---

## Using threads - matrix multiplication

```cpp
#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>

typedef struct __MatrixProductArgs {
  int size, resultRowIdx, resultColIdx;
  int* row;
  int* column;
  int** matResult;
} MatrixProductArgs;

void * computeMatrixProdElement (void *arg) {
  MatrixProductArgs* matProdArgs = (MatrixProductArgs*)arg;
  const int rowIdx = matProdArgs->resultRowIdx;
  const int colIdx = matProdArgs->resultColIdx;

  int cellValue = 0;
  for (int i = 0; i < matProdArgs->size; i++) {
    cellValue += matProdArgs->row[i] * matProdArgs->column[i];
  }

  matProdArgs->matResult[rowIdx][colIdx] = cellValue;

  return NULL;
}

int main () {
  int rowsA = 3;
  int A[3][3] = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
  };

  int columnsB = 3;
  int B[3][3] = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
  };

  const int threadsCount = rowsA * columnsB;

  pthread_t* threads= malloc(sizeof(pthread_t) * threadsCount);
  MatrixProductArgs matProdArgs[threadsCount];

  int** matResult = malloc(sizeof(int) * rowsA);
  
  for (int i = 0; i < rowsA; i++) {
    matResult[i] = malloc(sizeof(int) * columnsB);

    for (int j = 0; j < columnsB; j++) {
      // It's essential to declare this here in order to make sure that no duplicate values
      // are set into the resulting matrix.
      int *rightMatrixColumn = malloc(sizeof(int) * rowsA);
      for (int k = 0; k < rowsA; k++) {
        rightMatrixColumn[k] = B[k][j];
      }

      int threadIdx = rowsA * i + j;

      matProdArgs[threadIdx].row = A[i];
      matProdArgs[threadIdx].size = rowsA;
      matProdArgs[threadIdx].column = rightMatrixColumn;
      matProdArgs[threadIdx].resultRowIdx = i;
      matProdArgs[threadIdx].resultColIdx = j;
      // Only share the place where each thread will write uniquely.
      matProdArgs[threadIdx].matResult = matResult;

      int r = pthread_create(&threads[threadIdx], NULL, computeMatrixProdElement, &matProdArgs[threadIdx]);
      if (r != 0) {
        perror(NULL);
        return 1;
      }
    }
  }

  for (int i = 0; i < threadsCount; i++) {
    pthread_join(threads[i], NULL);
  }

  for (int i = 0; i < rowsA; i++) {
    for (int j = 0; j < columnsB; j++) {
      printf("%d ", matProdArgs->matResult[i][j]);
    }
    printf("\n");
  }

  return 0;
}
```

Usage:

```bash
gcc mat.c -o mat -pthread
./mat
30 36 42 
66 81 96 
102 126 150
```