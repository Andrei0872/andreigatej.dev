---
title: "C Notes"
slug: /my-dev-notes/c-notes
parent: "Dev Notes"
date: 2021-10-13
---

- [Custom implementation of `cp`](#custom-implementation-of-cp)

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