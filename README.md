## scharles

TypeScript + React customizable slideshow on browser. This supercedes [charles](https://github.com/maiswan/charles).

## Why upgrade?
In addition to almost every feature from charles, scharles allows:
* ⛏️ updating default config without rebuilding
* 🏹 multiple ways to control the slideshow
    * 🎮 HTTP endpoints
    * ⌨️ Command line
* 🐛 built-in debug mode
* 💬 expanded command set to control each component
* 💻 serving/controlling multiple client at once

## Setup

1. Modify configurations at `/server/env.json`.
2. Build the client with `npm run build:client`.
3. Run the built client.
4. Run the server with `npm run start:server`.

## Controlling the slideshow on the fly
scharles offers two main methods to control clients. They share similar syntaxes.

#### Command line (at server)

    clientId component action [parameter1 [parameter2...]] 


#### HTTP GET Endpoint

    localhost:port/clientId/component/action[/parameter1[/parameters...]]


### Example commands

    2 noise disable

This command line instruction commands client 2 to disable the noise component.

    localhost:12024/-1/backdropFilter/set/blur%2032px

This GET request commands all (-1) clients to blur their displaying images by 32 pixels.
