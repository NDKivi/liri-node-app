# liri-node-app
UMN coding bootcamp Node.js homework

Node app run from the command line that outputs info to the terminal and logs the same info to a file.

## Commands

**my-tweets** - displays up to 20 of the last tweets from Jean Luc Mélanchon

* Pulls info using the Twitter search API and node package from a particular user (Jean-Luc Mélanchon instead of my own Twitter account)

**spotify-this-song < track name >** - displays info about the track

* Pulls the info from Spotify using their API and node package

**movie-this < movie name >** - displays info about the movie 

* Pulls the info from OMDB using their API and the 'request' node package

**do-what-it-says** - runs a command from a mystery file

* Pulls commands from a file from the local file system using node's FS package and executes the commands from the file

**display-log** - displays the contents of the log file

* Command not given to user in other documentation or prompts.  Diplays the formatted text of the log file in the terminal since looking at the raw text file is ugly due to the escape sequences

## Technical details

* Output is formatted using the 'chalk' node package
* runCommand is the main function.  It uses a large switch statement to treat each command appropriately
* keys are kept secure in a .env file that must be created locally with the appropriate API keys in order for the app to run

## To-do

* Make date and time pretty from Twitter

