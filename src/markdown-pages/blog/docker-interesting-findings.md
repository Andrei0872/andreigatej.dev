# Under the hood of Docker: Interesting findings

* `idtools_unix`

```go
// CanAccess takes a valid (existing) directory and a uid, gid pair and determines
// if that uid, gid pair has access (execute bit) to the directory
func CanAccess(path string, pair Identity) bool {
	statInfo, err := system.Stat(path)
	if err != nil {
		return false
	}
	fileMode := os.FileMode(statInfo.Mode())
	permBits := fileMode.Perm()
	return accessible(statInfo.UID() == uint32(pair.UID),
		statInfo.GID() == uint32(pair.GID), permBits)
}
```

* `path` package - very interesting the way it is implemented

```go
func MkdirAll () { }
```

* how docker creates the `/var/run/docker.pid` file

```go
pf, err := pidfile.New(cli.Pidfile)

// New creates a PIDfile using the specified path.
func New(path string) (*PIDFile, error) {
	if err := checkPIDFileAlreadyExists(path); err != nil {
		return nil, err
	}
	// Note MkdirAll returns nil if a directory already exists
	if err := system.MkdirAll(filepath.Dir(path), os.FileMode(0755)); err != nil {
		return nil, err
  }
  
  // `os.Getpid()` - returns the PID of the caller(i.e the current process)
	if err := ioutil.WriteFile(path, []byte(fmt.Sprintf("%d", os.Getpid())), 0644); err != nil {
		return nil, err
	}

	return &PIDFile{path: path}, nil
}
```