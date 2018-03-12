#Chess Site
This site basically is set up to facilitate chess events and the likes.

# Getting up and running. 

The codebase is relays on the following:
* JS Promises
* Pug templating (formely know as Jade Templating)
* SequalizeJS ORM

## Setting the configs

The config/ directory accepts three filenames. 1) default.json, 2) development.json 3) production.json and uses one of these three to select the configuration values to use while running the app depending on what NODE_ENV you have sit. Never commit the development and the production config.

## Building the project

You need to have nodejs on your machine.

Then run

``
npm installl
``

to install all dependencies.

If you are using mysql2 instead of sqlite as a datastore then run

``
npm install mysql2
``

## Running the project

```
npm start
```

Is all you need to run to start the project.

## Email
The site uses nodemailer to send and recieve emails. Set up an oauth with your prefered email provider so that it works A okay in the config.
