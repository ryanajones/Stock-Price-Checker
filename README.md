# Stock Price Checker

A web app capable of checking Nasdaq stock prices. The user can utilize the front-end to enter which stocks to see the prices of, or alternatively, use the URL path and query parameters to request the information. As an added bonus to showcase skills of database usage, the user has the option to like the stock. Stock likes are recorded according to each user's IP address, so they can only like it one time. The JSON response will show current stock price and how many likes it has collected from different users. Another feature of this app is to compute two different stock entries at the same time, which will show the current stock prices and relative likes between the two. Node and Express are used to implement a RESTful api to hand the HTTP GET requests. Mongoose is used make communication between Node and MongoDB more efficient. jQuery's Ajax and DOM manipulation is used to handle the front-end requests and to display the JSON responses. The Chai and Mocha testing tools are used for function testing. 

## Technologies Used

HTML SCSS JavaScript jQuery NodeJS ExpressJS MongooseJS MongoDB Chai Mocha

## Deploy on Repl

https://replit.com/@ryanajones/stock-price-checker

## Screenshots

![alt text](https://i.imgur.com/IHeD39d.png)