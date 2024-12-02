# Recipe Sharing API

## General Info

**Project Title**: Recipe Sharing API  
**Author**: Miles Noble  
**Course**: CSE 341 Final Project  

This project is a recipe sharing platform built with Node.js, MongoDB, and OAuth-based authentication. It allows users to share, discover, rate, and comment on recipes. Users can log in using their social accounts (Google, Facebook, or GitHub) and manage their recipes and reviews. Admins can manage recipe categories and moderate content. The API supports CRUD operations and filtering features for a dynamic recipe sharing experience.

## Contents

- [Application Info](#application-info)
- [API Endpoint Planning](#api-endpoint-planning)
- [Project Scheduling and Delegation](#project-scheduling-and-delegation)
- [Potential Risks and Risk Mitigation Techniques](#potential-risks-and-risk-mitigation-techniques)

---

## Application Info

### What will the API do?

The Recipe Sharing API allows users to:
- **Share** recipes with ingredients and instructions.
- **Discover** new recipes based on categories, ratings, and search.
- **Comment** and **rate** recipes shared by others.
- **Admins** can manage recipe categories and moderate submissions.

### How will your API utilize a login system?

The API will utilize **OAuth authentication**, allowing users to log in via **Google**, **Facebook**, or **GitHub**. The OAuth provider will issue an access token, which is used to authenticate users for subsequent requests to the API.

### What database will you use?

MongoDB will be used to store data for users, recipes, reviews, and categories.

### How will the data be stored in your database?

Data will be organized into collections:
- **Users Collection**: Stores user data, including OAuth-specific fields.
- **Recipes Collection**: Stores recipes with details such as ingredients, instructions, and categories.
- **Reviews Collection**: Stores reviews for each recipe, including ratings and comments.
- **Categories Collection**: Stores recipe categories like "Desserts" and "Vegetarian."

### How would a frontend be able to manage authentication state?

After logging in via OAuth, the frontend will store the user's access token in **local storage**. This token will be included in request headers to manage the user’s authentication state when interacting with the API.

### What pieces of data in your app will need to be secured?

- **User OAuth tokens**: These will be transmitted securely over HTTPS to prevent interception.
- **User profile data**: User-specific data will be protected by authorization checks, ensuring that users can only access their own information.

### What file structure and program architecture will you use for this project?

The project will follow a **Modular MVC (Model-View-Controller)** architecture, ensuring clear separation of concerns and scalability. The file structure is as follows:

