/* Start imports/require */
require("dotenv").config();
const fs = require("fs");
const keys = require("./keys.js");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const chalk = require("chalk");
/* End imports/require */

/* Create clients with keys */
const spotifyClient = new Spotify(keys.spotify);
const twitterClient = new Twitter(keys.twitter);

/* Error text that displays available actions to user */
const invalidCommandError = chalk`Please specify a command to run.  Valid commands are the following:
{green.bold my-tweets} - displays up to 20 of your last tweets, assuming you are Jean-Luc Mélenchon
{green.bold spotify-this-song} {blue.bold <track name>} - displays info about the track
{green.bold movie-this} {blue.bold <movie name>} - displays info about the movie 
{green.bold do-what-it-says} - runs commands from a mystery file to disply tweets, movie info, or song info`;

const noDataReturned = chalk.red.underline("\nThis command failed");

/*  
@author
    Neal Kivi
@description
    Takes in a command and extra string, uses them to execute a specific command and display the
    result in the screen or display on error message
@params
    String myCommand - command to run, valid values are 'spotify-this-song', 'my-tweets', 'movie-this', and
                        'do-what-it-says'
    String myString - a string with the extra arguments for the 'movie-this' and 'spotify-this-song' commands
@returns
    Nothing
@displays
    results from API calls or error messages
*/
function runCommand(myCommand, myString) {
    switch (myCommand) {

        case "my-tweets":
            let params = { user_id: '80820758', count: 20 };
            twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
                if (!error) {
                    let myTweets = "";
                    for (let i = 0; i < tweets.length; i++) {
                        myTweets += chalk.hex("#00004d")("\n\n" + tweets[i].created_at);
                        myTweets += "\n" + tweets[i].text;
                    }
                    console.log(myTweets);
                    logToFile(myTweets);
                } else {
                    console.log(chalk.red.bold("Error retrieving tweets.  Sorry."));
                    logToFile(noDataReturned);
                }
            });
            break;

        case "spotify-this-song":
            let song;
            if (myString) {
                song = myString;
            } else {
                song = "The+Sign+by+Ace+of+Base";
            }
            spotifyClient.search({ type: "track", query: song, limit: 1 }, (error, data) => {
                if (error) {
                    console.log("ERROR: " + error);
                } else {
                    let artistNames = "";
                    if (data.tracks.items[0]) {
                        for (let artist of data.tracks.items[0].artists) {
                            artistNames += artist.name + " ";
                        }
                        let trackString =
                        chalk`

{hex("#00004d") Song Title:}             {bgWhiteBright.bold ${data.tracks.items[0].name}}
{hex("#00004d") Artists:}                ${artistNames}
{hex("#00004d") Album:}                  ${data.tracks.items[0].album.name}
{hex("#00004d") Preview URL:}            {underline ${data.tracks.items[0].preview_url}}
`;
                        console.log(trackString);
                        logToFile(trackString);
                    } else {
                        console.log(chalk.red("No song returned based on your input.  Please try again."));
                        logToFile(noDataReturned);
                    }

                }
            });
            break;

        case "movie-this":
            let title;
            if (myString) {
                title = myString;
            } else {
                title = "Mr. Nobody";
            }
            let URL = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy";
            request(URL, (error, response, data) => {
                if (!error && response.statusCode === 200) {
                    let movieObject = JSON.parse(data);
                    if (movieObject.Title) {
                        let movieString =
                        chalk`

{hex("#00004d") Movie Title:}            {bgWhiteBright.bold ${movieObject.Title}}
{hex("#00004d") Year:}                   ${movieObject.Year}
{hex("#00004d") IMDB Rating:}            ${movieObject.imdbRating}
{hex("#00004d") Rotten Tomatoes Rating:} ${movieObject.Ratings[1].Value}
{hex("#00004d") Country where produced:} ${movieObject.Country}
{hex("#00004d") Language:}               ${movieObject.Language}
{hex("#00004d") Plot:}                   ${movieObject.Plot}
{hex("#00004d") Actors:}                 ${movieObject.Actors}
`;
                        console.log(movieString);
                        logToFile(movieString);
                    } else {
                        console.log(chalk.red.bold("No movie returned based on your input.  Please try again"));
                        logToFile(noDataReturned);
                    }
                } else {
                    console.log(chalk.red.bold("Failure to retrieve movie data from server."));
                    logToFile(noDataReturned);
                }
            });
            break;

        case "do-what-it-says":
            fs.readFile("random.txt", "utf8", function (error, data) {
                if (!error) {
                    let args;
                    let lines = data.split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        args = lines[i].split(",");
                        if (args[0] && args[0] !== "do-what-it-says") {
                            runCommand(args[0], args[1] ? args[1] : "");
                        }
                    }
                } else {
                    console.log(chalk.red.bold("Error reading info from file" + error));
                    logToFile(noDataReturned);
                }
            });
            break;

        case "display-log":
            fs.readFile("log.txt", "utf8", function (error, data) {
                if (!error) {
                    console.log(data);
                } else {
                    console.log(chalk.red.bold("Error reading info from file" + error));
                }
            });
            break;

        case "":
            console.log(chalk.red.bold("No command specified."));
            console.log(invalidCommandError);
            logToFile(noDataReturned);
            break;

        default:
            console.log(chalk.red.bold("Invalid command specified."))
            console.log(invalidCommandError);
            logToFile(noDataReturned);
    }
}

/* 
Writes a string to the log.txt file in the same folder as this file.  Used both to 
log the actual command entered as well as the output when called by runCommand()
 */
function logToFile(theStuff) {
    fs.appendFile("log.txt", theStuff, function (err) {
        if (err)
            console.log("Problem adding to log.txt");
    });
}

/* At run-time */
/* Get command line agruments */
let command = process.argv[2] ? process.argv[2].toLowerCase() : "";

let remainingArguments = "";
for (let i = 3; i < process.argv.length; i++) {
    remainingArguments += process.argv[i] + "+";
}
logToFile(chalk.whiteBright.bgCyan("\n\nCommand:\t" + command + "\nOther args:\t" + remainingArguments));

/* Run input from command line */
runCommand(command, remainingArguments);