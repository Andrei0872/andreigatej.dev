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

## takeaways

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