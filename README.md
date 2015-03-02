# LIVES push alerts
This is a project done for the Accela Connect Hackathon (http://accelaconnect.com)

It allows a user to subscribe and receive push alerts when new inspection data is published for their favorite restaurants. The application is pointed at LIVES data sets for Evanston, IL but could easily be pointed at any LIVES data set for any municipality.

## Setup

Create a database and configure any variables in app/web.js and app/web.js that need configuring (database, twilio settings, dataset urls/ids).

Install dependencies:
	> npm install

## Usage

There are 2 components to this app. There’s a web server (app/web.js) and a worker (app/worker.js). The web server allows users to search for and subscribe to their favorite restaurants. The worker will periodically check for new inspection data and alert the user when new inspections are found meeting the specified criteria.

### Run the web server
	> node app/web.js

### Run the worker on a schedule
	> node app/worker.js


	