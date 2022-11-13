const express = require("express");
const { books } = require("../data/books.json")
const { getAllBooks, getSingleBookById, getAllIssuedBooks } = require("../controllers/book-controller");
const { users } = require("../data/users.json")

const { UserModel, BookModel } = require("../models");

const router = express.Router();

/*  Route: /books
    Method: Get
    Description: Get all books
    Access: Public
    Parameters: none
*/

router.get('/', getAllBooks);



/*  Route: /books/:id
    Method: Get
    Description: Get books by ID
    Access: Public
    Parameters: id
*/

router.get('/:id', getSingleBookById);



/*  Route: /books/issued/by-user
    Method: Get
    Description: Get all issued books
    Access: Public
    Parameters: none
*/

router.get('/issued/by-user', getAllIssuedBooks);



/*  Route: /books/issued/by-user
    Method: Post
    Description: Create new book
    Access: Public
    Parameters:
    Data: auther, name, genre, price, publisher, id
*/

router.post('/', (req, res) => {
    const { data } = req.body;

    if (!data)
        return res.status(400).json({
            success: false,
            massage: "No data provided",
        });

    const book = books.find((each) => each.id === data.id);
    if (book)
        return res.status(404).json({
            success: false,
            massage: "Book already exists with this ID, Please use a unique ID",
        })

    const allBooks = [...books, data];

    return res.status(201).json({
        success: true,
        data: allBooks,
    })
});


/*  Route: /books/issued/:id
    Method: Put
    Description: Update book
    Access: Public
    Parameters: id
    Data: auther, name, genre, price, publisher, id
*/

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    const book = books.find((each) => each.id === id);

    if (!book) {
        return res.status(400).json({
            success: false,
            massage: "Booka not found with this ID",
        });
    }

    const updateData = books.map((each) => {
        if (each.id === id) {
            return { ...each, ...data };
        }
        return each;
    });
    return res.status(200).json({
        success: true,
        data: updateData,
    });
});



/*  Route: /users/fine/:id
    Method: Delete
    Description: Get fine details
    Access: Public
    Parameters: id
*/

router.get("/fine-details/:id", (req, res) => {
    const { id } = req.params;

    const user = users.find((each) => each.id === id);

    if (!user)
        return res.status(404).json({
            success: false,
            message: "Book not found",
        });

    const getDateInDays = (data = "") => {
        let date;
        if (data === "") {

            date = new Date();
        } else {

            date = new Date(data);
        }
        let days = Math.floor(date / (1000 * 60 * 60 * 24));
        return days;
    };

    const subscriptionType = (date) => {
        if (user.subscriptionType === "Basic") {
            date = date + 90;
        } else if (user.subscriptionType === "Standard") {
            date = date + 180;
        } else if (user.subscriptionType === "Premium") {
            date = date + 365;
        }
        return date;
    };

    // Subscription expiration calculatio 01/01/1970, UTC. //// milliseconds
    let returnDate = getDateInDays(user.returnDate);
    let currentDate = getDateInDays();
    let subscriptionDate = getDateInDays(user.subscriptionDate);
    let subscriptionExpiration = subscriptionType(subscriptionDate);

    const data = {
        ...user,
        fine:
            returnDate < currentDate
                ? subscriptionExpiration <= currentDate
                    ? 200
                    : 100
                : 0,
    };

    res.status(200).json({
        success: true,
        data,
    });
});



module.exports = router;