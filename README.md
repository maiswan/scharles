## scharles

TypeScript + React customizable slideshow on browser.

https://github.com/user-attachments/assets/a7e48d89-d39c-4d67-96fd-addd17d1c10a

In addition to almost every feature from [charles](https://github.com/maiswan/charles), scharles enables:
* ⛏️ updating default config without rebuilding
* 🏹 multiple ways to control the slideshow
    * 🎮 HTTP endpoints
    * ⌨️ Command line
* 🐛 a built-in debug mode and logging
* 💬 an expanded command set to control each component
* 💻 serving and controlling multiple client at once

## Setup

1. Make a copy of `/server/config.sample.json` as `config.prod.json` and populate the configuration file.
2. Build the client with `npm run build:client`.
3. Run the client at `/client/dist/index.html`.
4. Run the server with `npm run start:server`.

## Remote control on the fly
scharles offers two main methods to control clients. They use the same syntax.

| Source | Syntax |
|--------|--------|
| Command line (at server process) | ```clientId module action [parameters...]``` |
| HTTP GET endpoint | ```localhost:port/command/clientId module action [parameters...]``` |

### Example commands

    2 noise disable

This command line instruction commands client 2 to disable the noise component.

    localhost:12024/command/-1 backdropFilter set blur 32px

This GET request commands all (-1) clients to blur their displaying images by 32 pixels.
