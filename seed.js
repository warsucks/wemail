/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Email = Promise.promisifyAll(mongoose.model("Email"));
var faker = require('faker');

var numEmails = 5000;

var seedUsers = function () {
    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];
    return User.createAsync(users);
};

var findLength = function(content){
  var array = content.split(" ");
  return array.length;
};

var findWords = function(content){
  var array = content.split(" ");
  var words = [];
  array.forEach(function(word){
    if(words.indexOf(word) === -1){
      words.push(word);
    }
  });
  return words;
};

var seedEmails = function() {
  var emails = [];
  var randomTags = ['chocolate', 'cake','love', 'school', 'work', 'mom', 'cold', 'pizza'];
  for(var i = 0; i < numEmails; i++){
    var email = {
      content: null,
      subject: null,
      tags: [],
      location: null,
      timestamp: null,
      length: null,
      gender: null,
      words: null,
    };
    email.content = faker.lorem.paragraphs();
    email.subject = faker.lorem.sentence();
    var numOfTags = faker.random.number() % 100;
    // for(var j = 0; j < numOfTags; j++){
      //var tag = faker.hacker.noun();
      randomTags.forEach(function(tag) {
        if(Math.random()>0.2)
        {
          email.tags.push(tag);
        }
      })
    // }
    var location = {
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude()
    };
    email.timestamp = Date(2014, Math.floor(Math.random()*13), Math.floor(Math.random()*31));
    email.length = findLength(email.content);
    var genderSetter = faker.random.number();
    if(genderSetter > 1000) email.gender = "M";
    else email.gender = "F";
    email.words = findWords(email.content);
    emails.push(email);
    console.log(numEmails - i)
  }
  console.log(emails)
  return Email.createAsync(emails);
};

connectToDb.then(function () {
    User.findAsync({}).then(function (users) {
        if (users.length === 0) {
            return seedUsers();
        } else {
            console.log(chalk.magenta('Seems to already be user data, exiting!'));
            process.kill(0);
        }
    }).then(function(){
      console.log("Good");
      return seedEmails();
    }).then(function (emails) {
        console.log("emails in seed ", emails);
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});
