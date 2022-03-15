const fs = require('fs');
const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const Review = require('../model/reviewModel');
require('dotenv').config({ path: '../config.env' });

const mongoose = require('mongoose');
const db = process.env.DATABASE_LOCAL;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    // useFindAndModify: false,
  })
  .then((el) => {
    console.log('mongodb connected successfully ');
  });

// read json file

const tours = JSON.parse(fs.readFileSync('./data/tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./data/reviews.json', 'utf-8'));

// import data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(reviews);

    console.log('data inserted sucessfully ');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deleted  sucessfully ');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
