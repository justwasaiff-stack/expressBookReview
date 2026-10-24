const express = require('express');
let books = require('./booksdb.js');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop using Async/Await / Promises
public_users.get('/', async function (req, res) {
  try {
    // Using Promise / Async simulation to get books
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const bookList = await getBooks;
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN using Promises / Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const getBookByIsbn = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    });
    const bookDetails = await getBookByIsbn;
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(error.status  500).json({ message: error.message  "Internal server error" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorName = req.params.author;
  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      let matchedBooks = [];
      let keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
          matchedBooks.push({
            isbn: key,
            title: books[key].title,
            reviews: books[key].reviews
          });
        }
      });
      if (matchedBooks.length > 0) {
        resolve(matchedBooks);
      } else {
        reject({ status: 404, message: "Author not found" });
      }
    });
    const result = await getBooksByAuthor;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status  500).json({ message: error.message  "Internal server error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const titleName = req.params.title;
  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      let matchedBooks = [];
      let keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].title.toLowerCase() === titleName.toLowerCase()) {
          matchedBooks.push({
            isbn: key,
            author: books[key].author,
            reviews: books[key].reviews
          });
        }
      });
      if (matchedBooks.length > 0) {
        resolve(matchedBooks);
      } else {
        reject({ status: 404, message: "Title not found" });
      }
    });
    const result = await getBooksByTitle;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status  500).json({ message: error.message  "Internal server error" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
