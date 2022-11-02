# i18n-node-db
TODO finish README.MD


## Logging & Debugging

Logging any kind of output is moved to [debug](https://github.com/visionmedia/debug) module. To let i18n output anything run your app with `DEBUG` env set like so:

	$ DEBUG=i18n:* node app.js

i18n exposes three log-levels:

* i18n:debug
* i18n:warn
* i18n:error

if you only want to get errors and warnings reported start your node server like so:

	$ DEBUG=i18n:warn,i18n:error node app.js

Combine those settings with you existing application if any of you other modules or libs also uses __debug__
