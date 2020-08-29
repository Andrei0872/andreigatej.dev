## docker daemon

* a program that runs in the background on your OS
* started as a system utility: docker is automatically started;`sudo systemctl enable docker`
* you can start the `docker daemon` automatically: `dockerd` command(needs sudo privileges)
* it can be configured via command line or via a configuration file
* `/var` - contains files that might change in size; `/var/lib` - contains dynamic data libraries and files of programs - it's where docker daemon holds its data: `/var/lib/docker`

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