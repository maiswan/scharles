## scharles

TypeScript + React customizable slideshow on browser.

https://github.com/user-attachments/assets/a7e48d89-d39c-4d67-96fd-addd17d1c10a

In addition to almost every feature from [charles](https://github.com/maiswan/charles), scharles enables:
* ⛏️ updating default config without rebuilding
* 🏹 multiple ways to control the slideshow
    * 🎮 HTTP endpoints with access control via JWT
    * ⌨️ Command line
* 🐛 a built-in debug mode and logging
* 💬 an expanded command set to control each component
* 💻 serving and controlling multiple client at once

## Setup

1. Create some TLS certs: `npm run mkcert`
2. Trust the CA cert. Consult your platform docs for details.
    - On Windows, double click `/server/certs/ca.crt` → Install Certificate → Current User → **Place all certificates in the following store** → **Trusted Root Certification Authorities**
3. Copy `/server/config.sample.json` as `config.prod.json` and populate the configuration file.
    - Defaults are available for all fields other than those under `server.authentication`.
    - Fill in the `keys` and `jwtSecret` fields with cryptographically-secure keys. On Windows, you may find my program [Passwhat](https://github.com/maiswan/Passwhat) handy.
5. Run the server: `npm run start:server`
6. Build the client: `npm run build:client`
7. Run the client at `/client/dist/index.html`

Steps 2 and 3 are necessary because scharles uses JWT over HTTPS to enforce access control.

## Remote control on the fly
scharles offers two main methods to control clients. They use the same syntax.

| Source | Syntax |
|--------|--------|
| Command line (at server process) | `clientIds module action [parameters...]` |
| HTTP endpoint | `https://host:port/api/v4/command` |

### Example commands
#### Command Line

    2 noise disable

This commands client 2 to disable the noise component.

#### HTTP Endpoint

Ensure you have the relevant API keys inside your configuration files. The `controller` role will allow you to add new commands, while the `admin` role will further allow you see list and delete added commands.

Obtain a JWT by sending a POST request to the authentication endpoint.
```http
POST /api/v4/auth HTTP/1.1
Host: host:port
Content-Type: application/json
Content-Length: 30

{
  "apiKey": "Your API key"
}
```

With your token, send a POST to the command endpoint:
```http
POST /api/v4/commands HTTP/1.1
Host: host:port
Content-Type: application/json
Content-Length: 107
Authorization: Bearer YourJwtToken

{
   "clientId": -1,
   "module": "backdropFilter",
   "action": "set",
   "parameters": ["blur", "32px"]
}
```
This commands all (-1) clients to blur their displaying images by 32 pixels.
