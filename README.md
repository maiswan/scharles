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

1. Copy `/server/config.sample.json` as `config.prod.json` and populate the configuration file.
2. Make and sign TLS certs: `npm run mkcert`
3. Trust the CA cert. Consult your platform docs for details.
    - On Windows, double click `/server/certs/ca.crt` → Install Certificate → Current User → **Place all certificates in the following store** → **Trusted Root Certification Authorities**
4. Run the server: `npm run start:server`
5. Build the client: `npm run build`
6. Run the client at `/client/dist/index.html`

Steps 2 and 3 are necessary because scharles uses JWT over HTTPS to enforce access control.

## Remote control on the fly
scharles offers two main methods to control clients. They use the same syntax.

| Source | Syntax |
|--------|--------|
| Command line (at server process) | `clientId module action [parameters...]` |
| HTTP endpoint | `https://localhost:port/api/v3/command` |

### Example commands
#### Command Line

    2 noise disable

This command line instruction commands client 2 to disable the noise component.

#### HTTP Endpoint

Ensure you have the relevant API keys inside your configuration files. The `controller` role will allow you to add new commands, while the `admin` role will further allow you see list and deleted all added commands.

Obtain your JWT via `POST localhost:port/api/v3/auth` with the body
```json
{
    "apiKey": "Your API key"
}
```

With your token, `POST localhost:port/api/v3/commands` with the header and body:

    Authorization: Bearer YourJwtToken

    {
        "clientId": -1,
        "module": "backdropFilter",
        "action": "set",
        "parameters": ["blur", "32px"]
    }

This POST request commands all (-1) clients to blur their displaying images by 32 pixels.
