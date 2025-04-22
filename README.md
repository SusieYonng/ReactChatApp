# WeChat-Style Chat App (1-on-1 Messaging)

This is a web-based one-on-one messaging application built with **React + Vite + Express (Node.js)**. It supports real-time chat between registered users, with user profiles, friend management, and chat history display — modeled after a simplified WeChat-style layout.

---

## 🚀 Features

- **User Authentication**

  - Register with a unique username
  - Log in and log out securely using session-based authentication

- **Profile Management**

  - View and edit nickname and personal bio (signature)
  - Avatar generated from username initials

- **Friend System**

  - Search and add registered users as friends
  - Accept or reject incoming friend requests
  - View detailed profile of any friend

- **1-on-1 Messaging**

  - Send and receive private messages with friends
  - Timestamped messages with automatic scrolling to latest
  - Message draft saved per conversation (auto-restored)
  - New message notification badge for unseen messages
  - Scroll up to view history with new message popups when not at the bottom

- **Chat Layout**
  - Three-pane responsive layout:
    - Left: Navigation (Avatar, Chats, Contacts, Logout)
    - Middle: Conversation list or contact list
    - Right: Chat messages or user profiles

---

## 🛠️ Getting Started

### 1. Install Dependencies

After cloning the repository, install all required packages:

```bash
npm install
```

### 2. Development Mode

To run the app in development mode, start both frontend and backend:

```bash
# Start the Vite dev server (frontend)
npm run dev

# Start the Express backend (in another terminal)
npm run dev:server
```

### 3. Production Mode

To build and preview the production version:

```bash
# Build frontend assets
npm run build

# Serve the production build and start backend
npm run start
```

Then open your browser at `http://localhost:3000` to view the app.

## 💻 How to Use

1. See **Getting Started** above to launch the application locally.

2. **Register / Log In**

   - Use a unique username (no password for demo simplicity)
   - To simulate multiple users, use different browsers or private/incognito windows

3. **Add and Chat with Friends**
   - Switch to “Contacts”
   - Search for exact usernames
   - Send a friend request, wait for approval
   - Start chatting from contact profile or recent chat list

## 📌 Notes

- This is a course project and not meant for production use

---

# Third-Party Icon Assets

The following icons used in this project are sourced from Google Fonts Icons.

## Icons

### chat.svg

- **Filename**: chat.svg
- **Origin**: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:chat&icon.color=%231f1f1f
- **License**: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### chat_active.svg

- **Filename**: chat_active.svg
- **Origin**: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:chat&icon.color=%2345a049
- **License**: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### contacts.svg

- **Filename**: contacts.svg
- **Origin**: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:contacts&icon.color=%231f1f1f
- **License**: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### contacts_active.svg

- **Filename**: contacts_active.svg
- **Origin**: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:contacts&icon.color=%2345a049
- **License**: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### logout.svg

- **Filename**: logout.svg
- **Origin**: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:logout&icon.color=%231f1f1f
- **License**: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
