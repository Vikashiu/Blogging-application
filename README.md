# ✍️ AI-Powered Blogging Platform

[![Deploy with Vercel](https://vercel.com/button)](https://blogging-application-rho.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18-green)](https://nodejs.org/)

> **Transforming ideas into polished articles. A full-stack blogging engine powered by Google Gemini to automate titles, refine content, and streamline your writing workflow.**

---

## 🔗 Live Demo
🚀 **[View Live Application](https://blogging-application-rho.vercel.app)**

---

## 💡 Motivation

Creating consistent, high-quality technical content is difficult. Developers and writers often face **writer's block**, struggle to craft SEO-friendly titles, or spend excessive time proofreading.

I built this platform to **reduce the friction of content creation**. By integrating the **Google Gemini API**, the application acts as an intelligent writing partner that handles the heavy lifting—generating engaging titles and refining rough drafts—allowing users to focus purely on their ideas rather than the mechanics of writing.

## ✨ Key Features

### 🤖 AI-Powered Assistance
* **Smart Title Generator:** Generates catchy, SEO-optimized titles based on your article's keywords using Gemini AI.
* **Content Polisher:** Automatically corrects grammar, improves sentence flow, and adjusts tone with a single click.

### 📝 Core Blogging Features
* **Rich Text Editor:** A seamless writing interface for formatting code blocks, headings, and lists.
* **Secure Authentication:** Robust sign-up and login system using JWT (JSON Web Tokens) and HTTP-only cookies.
* **Dashboard:** Manage your published posts and drafts in one centralized location.
* **Responsive Design:** Fully optimized reading and writing experience on mobile, tablet, and desktop.

## 🛠️ Tech Stack

This project is built using a modern, scalable **PERN** stack (Postgres, Express, React, Node) with TypeScript:

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | **React.js + Vite** | Dynamic UI and fast state management |
| | **TypeScript** | Type safety and better developer experience |
| | **Tailwind CSS** | Responsive styling and modern design system |
| **Backend** | **Node.js & Express** | RESTful API architecture |
| **Database** | **PostgreSQL** | Relational database for structured data |
| | **Prisma ORM** | Type-safe database queries and schema management |
| **AI** | **Google Gemini API** | Large Language Model for content generation |
| **Deployment** | **Vercel** | Frontend hosting and CI/CD |

## ⚙️ Environment Variables

To run this project locally, you will need to create a `.env` file in the `server` directory with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/blog_db"

# AI Configuration
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Security
JWT_SECRET="your_super_secret_random_string"

# Server Config
PORT=3000
```

🚀 Getting Started
Follow these steps to set up the project locally:

1. Clone the Repository
Bash

git clone [https://github.com/Vikashiu/Blogging-application.git](https://github.com/Vikashiu/Blogging-application.git)
cd Blogging-application
2. Backend Setup
Bash

cd server
npm install
# Set up your .env file here
npx prisma generate
npx prisma migrate dev --name init
npm run dev
3. Frontend Setup
Bash

cd client
npm install
npm run dev
The application should now be running at http://localhost:5173 (Frontend) and http://localhost:3000 (Backend).

🔮 Future Improvements
[ ] Add "Image Generation" feature using Stable Diffusion for blog covers.

[ ] Implement specific "Tech," "Lifestyle," and "News" categories.

[ ] Add a commenting system for reader engagement.

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Built with ❤️ by Vikash Sinha


---

