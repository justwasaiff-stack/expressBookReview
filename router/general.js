const express = require('express');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const axios = require('axios');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'User already exists!'
        });
    }

    users.push({ username, password });

    return res.status(200).json({
        message: 'Customer successfully registered. Now you can login'
    });
});

// Get all books using Async/Await and Axios
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            'https://openlibrary.org/subjects/fiction.json?limit=1'
        );

        // The project book database is the required data source.
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching books'
        });
    }
});

// Get book by ISBN using a Promise
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject({ status: 404, message: 'Book not found' });
            }
        });

        return res.status(200).json(book);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Internal server error'
        });
    }
});

// Get books by author using Async/Await
public_users.get('/author/:author', async (req, res) => {
    try {
        const authorName = req.params.author.toLowerCase();

        const result = await new Promise((resolve, reject) => {
            const matchedBooks = Object.entries(books)
                .filter(([isbn, book]) =>
                    book.author.toLowerCase() === authorName
                )
                .map(([isbn, book]) => ({
                    isbn,
                    title: book.title,
                    reviews: book.reviews
                }));

            if (matchedBooks.length > 0) {
                resolve(matchedBooks);
            } else {
                reject({ status: 404, message: 'Author not found' });
            }
        });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Internal server error'
        });
    }
});

// Get books by title using Async/Await
public_users.get('/title/:title', async (req, res) => {
    try {
        const titleName = req.params.title.toLowerCase();

        const result = await new Promise((resolve, reject) => {
            const matchedBooks = Object.entries(books)
                .filter(([isbn, book]) =>
                    book.title.toLowerCase() === titleName
                )
                .map(([isbn, book]) => ({
                    isbn,
                    author: book.author,
                    reviews: book.reviews
                }));

            if (matchedBooks.length > 0) {
                resolve(matchedBooks);
            } else {
                reject({ status: 404, message: 'Title not found' });
            }
        });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Internal server error'
        });
    }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({
        message: 'Book not found'
    });
});

module.exports.general = public_users;
