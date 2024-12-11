# bakuretsu - 爆裂

~~システムを爆裂魔法にする~~

Simple BAcKp/REStore (バクレス) config and secret files

### Requirements

- [SOPS](https://github.com/getsops/sops)
- NodeJS
- UNIX systems

### Usage

1. Create a config file

```yaml
# config.yml

config:
  encrypted: false
  matches:
    - root: ~/.config/nvim/
      patterns:
        - ~/.config/nvim/**/*

secret:
  encrypted: true
  matches:
    - root: ~/.ssh/
      patterns:
        - "~/.ssh/*"
        - "!~/.ssh/known_hosts*"
```

`config` and `secret` top keys are just a name, can be any string

```bash
npm run dev --action=backup --pgp=<pgp_fingerprint> --backend=local
```

Above command will create `tmp/backup.zip` file

### TODO

- Binary executable
- Extract SOPS to multiple encryptor/decryptor interface
- More backends: S3, Git, Google Drive
- Cross-platform
