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

* creating a unix socket

```go
func NewUnixSocket(path string, gid int) (net.Listener, error) {
	if err := syscall.Unlink(path); err != nil && !os.IsNotExist(err) {
		return nil, err
	}
	mask := syscall.Umask(0777)
	defer syscall.Umask(mask)

	l, err := net.Listen("unix", path)
	if err != nil {
		return nil, err
	}
	if err := os.Chown(path, 0, gid); err != nil {
		l.Close()
		return nil, err
	}
	if err := os.Chmod(path, 0660); err != nil {
		l.Close()
		return nil, err
	}
	return l, nil
}
```

* check if a process is alive using the `kill` command

```go
// IsProcessAlive returns true if process with a given pid is running.
func IsProcessAlive(pid int) bool {
	err := unix.Kill(pid, syscall.Signal(0))
	if err == nil || err == unix.EPERM {
		return true
	}

	return false
}
```

* file truncation

```go
// `foo.txt`: 12345
// without `os.O_TRUNC` 99995

func main() {
	f, _ := os.OpenFile("foo.txt", os.O_WRONLY|os.O_TRUNC, 0600)

	f.Write([]byte("9999"))
}
```

https://stackoverflow.com/questions/32717793/understanding-file-truncation/32717926
