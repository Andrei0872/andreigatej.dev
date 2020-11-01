## docker daemon

* a program that runs in the background on your OS
* started as a system utility: docker is automatically started;`sudo systemctl enable docker`; can check it with `ps -e | grep docker`
* you can start the `docker daemon` automatically: `dockerd` command(needs sudo privileges)
* it can be configured via command line or via a configuration file
* `/var` - contains files that might change in size; `/var/lib` - contains dynamic data libraries and files of programs - it's where docker daemon holds its data: `/var/lib/docker`
* `/var/run/docker.pid`
* docker socket location: `unix:///var/run/docker.sock` - default HOST
* when starting the server, it will first check if there is a `docker` group; if it doesn't exist, the docker engine will start under `root` permissions

### docker daemon config file

* at `/etc/docker/daemon.json`
* https://medium.com/@sujaypillai/docker-daemon-configuration-file-f577000da655 - try reloading - SIGHUP
* https://sandro-keil.de/blog/docker-daemon-tuning-and-json-file-configuration/

## worth a closer look

* `flags.BoolP("version", "v", false, "Print version information and quit")`; because of `flags.StringVar(&opts.configFile, "config-file", defaultDaemonConfigFile, "Daemon configuration file")`

## from env

```go
var (
	dockerCertPath  = os.Getenv("DOCKER_CERT_PATH")
	dockerTLSVerify = os.Getenv("DOCKER_TLS_VERIFY") != ""
)
```

```go
configDir     = os.Getenv("DOCKER_CONFIG")
```

## to research

* linux services
* `if cli.Config.IsRootless() ` - what happens if it is _rootless_ ?
* `cli.Config.Hosts` - when len > 1 ? 
* `strings.splitN(str, sep, N)`
* `switch proto { case "fd": ... }`
* `/net` - what is dial?
* a process per container ?
* https://www.youtube.com/watch?v=z-ITjDQT7DU
* https://www.youtube.com/watch?v=_WgUwUf1d34
* https://www.youtube.com/watch?v=Js_140tDlVI&ab_channel=Docker
* https://blog.lizzie.io/linux-containers-in-500-loc.html
* `what is containerd`
* https://www.youtube.com/watch?v=x1npPrzyKfs&ab_channel=linuxfestnorthwest

* check /proc/PID/uid_map in container
* check fs in container (mount namespace
* check hostname in container

* how can containers from a network communicate with each other(`FORWARD` policy?)

## takeaways

* `/var/run/docker` - the `ExecRoot`

* `case "udp", "udp4", "udp6":`
* get the actual type that implements an interface
  ```go
	switch hint := hint.(type) {
	case *TCPAddr:
		tcp = hint
		wildcard = tcp.isWildcard()
	case *UDPAddr:
		udp = hint
		wildcard = udp.isWildcard()
	case *IPAddr:
		ip = hint
		wildcard = ip.isWildcard()
	}

	type Addr interface {
		Network() string // name of the network (for example, "tcp", "udp")
		String() string  // string form of address (for example, "192.0.2.1:25", "[2001:db8::1]:80")
	}
	```

```go
// checking if a PID exists - useful for `/var/run/docker.pid`
func processExists(pid int) bool {
	if _, err := os.Stat(filepath.Join("/proc", strconv.Itoa(pid))); err == nil {
		return true
	}
	return false
}
```

```bash
/var/run/containerd/.../moby/hash/config.json | jq .root # the location of the root filesystem
```

* `runc`

```go
// StockRuntimeName is the reserved name/alias used to represent the
// OCI runtime being shipped with the docker daemon package.
StockRuntimeName = "runc"

// this is also de default runtime
```

## very interesting, worth showing

### creating a container from an ubuntu image

```bash
docker container run --name my-container --rm -it ubuntu:18.04 bash
```

As a side note, if we were to start the container like this:

```bash
docker container run --name my-container2 --rm  ubuntu:18.04
```

it will be created and destroyed *immediately*. This is because containers are **running processes** and since in the container there is no running process, it can't be alive after its creation. By using `-it ... bash` we're starting a process (`bash`) and so the container is alive as long as the `bash` process is alive. It can be killed by typing `exit` or pressing or `CTRL + D`.

### docker networking

```bash
# show the existing bridges
# notice there is nothing under the `interfaces` column
brctl show
docker0		8000.0242192bc7be	no


# first, create  the container
docker container run --name my-cont --rm -d -it ubuntu:20.04 bash

# now we can see that the container has been connected to the network
brctl show
docker0		8000.0242192bc7be	no		vethdd21dfa


# after adding another container
docker container run --name my-cont2 --rm -d -it ubuntu:20.04 bash
# we should see another interface added to the column
brctl show
docker0		8000.0242192bc7be	no		veth70d54dc
																	vethdd21dfa
```

## references

### iptables

* https://www.karlrupp.net/en/computer/nat_tutorial
* https://www.thegeekstuff.com/2011/06/iptables-rules-examples/

## Questions

* `docker.go#loadDaemonConfig`

	```go
	if flags.Changed("graph") && flags.Changed("data-root") {
		return nil, errors.New(`cannot specify both "--graph" and "--data-root" option`)
	}
  ```

* `Config.CommonConfig.MaxConcurrentDownloads`
* `Config.CommonUnixConfig.Runtimes`
* `daemon/config/config.go#config.ValidatePlatformConfig()` - `INC` * `cgroups`
* what happens if `cli.Config.Rootless=true` ?
* `daemon_unix.go#setupRemappedRoot` - `config.RemappedRoot` - what it does; related to **user namespaces**; on Google: docker daemon mapped roots; (my crt understanding): if you want to run docker in _rootless_ mode, you'll have to grant execute access (`+x`) to your user; worth researching on mount namespaces;
  * linux mount propagation
* `/var/lib/docker/unmount-on-shutdown` -> `daemon_unix.go#setupDaemonRootPropagation` 
* `daemon.go#newAPIServerConfig` - what happens if `TLS` is set? `if cli.Config.TLS != nil && *cli.Config.TLS {}`

https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt