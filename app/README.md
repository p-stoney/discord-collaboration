## Document Collaboration Discord Bot

### Overview

The aim of this application is to integrate a document management system directly into Discord by interfacing with a built-in Discord bot. It presents an accessible alternative to existing collaborative software solutions that is decoupled from external providers (see: Google Docs, OnlyOffice), feature-slim, and completely free. It serves a market at reduced scale, enabling collaborative document management for smaller scale teams, hobbyists, gamers, etc. Interfacing with the Discord bot allows users to seamlessly collaborate within their Discord environment without ever having to log in to a third party service.

### Key Technologies

**TypeScript:** Ensures type safety, improves code readability and maintainability.  
 **Nest.js:** Progressive Node.js framework for building efficient and scalable server-side applications.  
 **Discord.js:** Robust library for interacting with the Discord API and creating Discord bots.  
 **MongoDB Atlas:** Cloud-based MongoDB service for storing and managing data.  
 **Mongoose:** Schema-based solution for MongoDB validation, casting, and business logic.  
 **Passport:** Flexible authentication middleware for Node.js. Used here to simplify OAuth2 flow.  
 **Socket.IO:** Event-driven library enabling real-time communication between browser client and backend.

### Setup Instructions

**MongoDB Atlas Setup**

1. Create an account for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a cluster, whitelist your IP address, and connect your application.
3. Copy the provided connection string into your .env file, setting it to variable `MONGO_URI`.

**Discord Bot Setup**

4.  Visit the [Discord Developer Portal](https://discord.com/developers/applications) and log in.
5.  Setup your bot via [Discordjs Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).
6.  Ensure the following 'Privileged Gateway Intents' are toggled on: 'PRESENCE INTENT', 'SERVER MEMBERS INTENT', AND 'MESSAGE CONTENT INTENT'.
7.  Copy your 'CLIENT ID', 'CLIENT SECRET', and chosen Redirect URI into .env.

**Repository Setup**

8. Clone the repository with `git clone https://github.com/p-stoney/collaboration-discord-bot`.
9. Install dependencies in both root directory and in /frontend with `npm install`.
10. Ensure redis is running and build your static webpage with `npm run build`.
11. Build and start the application with `npm run start`.

### How to Interact

1.  In your Discord server, type `/help` to view all available slash commands.
2.  Type `register`, and the bot will provide a registration link to register your account with the application.
3.  Other available commands:

        `/create` to create a new document
        `/list` to list all accessible documents
        `/share` to share a document with another user
        `/open` to open a document in your browser for editing
        `/download` to download a document to your local machine

### Notes and Next Steps

This application is still in early development. Short-term development goals include improving user experience by replacing mere slash-command interactions with message components to better encapsulate interactions with buttons, select forms, modals, etc. Currently only the /share command utilizes message components, but this should serve as an example of what the other commands should look like after refactoring. Message components are a strict necessity from an end-user perspective. Long term development would include an embedded app interface for users to interact within their Discord application, and a more robust real-time collaboration strategy implementing operational transformation.

Pending further frontend development, the repository would likely be shifted into a monolithic architecture.

### Note to Reviewers

The project retrospective can be accessed [here](https://docs.google.com/document/d/13SRN3UaJSyBtItIcNe6iaKeSSTb41s8rUS3vSjNXlpc/edit?usp=sharing).
