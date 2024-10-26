## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Cloudinary Setup](#cloudinary-setup)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

## Project Overview
This application provides a system to manage products and their variants, including image uploads to Cloudinary. Each product includes attributes that define its variants and combinations, which are created through structured forms. The data is saved in local storage, allowing persistence across sessions.

## Features
- **Product Management**: Add, edit, and view products with associated variants.
- **Variants and Combinations**: Generate combinations based on variant selections.
- **Image Upload**: Upload product images to Cloudinary.
- **Local Storage**: Save product and variant data to local storage for seamless use.
- **Forms for Data Entry**: Utilize forms for product, variant, and combination creation.

## Technologies Used
- **React** (Frontend Library)
- **TypeScript** (Static Typing)
- **Tailwind CSS** (CSS Framework)
- **Vite** (Frontend Tooling)
- **Cloudinary** (Image Hosting and Management)
- **Vercel** (Deployment Platform)

## Project Structure
The project follows a component-based structure. The main directories are:
- **public**: Contains `products.json` and configuration files.
- **src**: Houses the main application components, pages, and forms for managing products and variants.
- **types.tsx**: Defines TypeScript interfaces (`Product`, `Variant`, `Combination`, `Category`) used throughout the project.
- **vercel.json**: Contains Vercel configuration for deployment.

## Installation
To set up the project locally:
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <project_directory>
   npm install
   npm run dev

##Cloudinary Setup
To enable image upload to Cloudinary, set up the following environment variables in your .env file:

env
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

##Deployment
--To deploy this project on Vercel:

--Push your code to GitHub or another repository.
--Connect the repository to Vercel.
--Adjust any necessary configurations in vercel.json located in the public folder for Vercel deployment.
