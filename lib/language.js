/**
 * @author      Created by Boldisor Andrian <aboldisor@gmail.com> on 2013-11-26.
 * @link        https://github.com/aboldisor
 * @license     http://opensource.org/licenses/MIT
 *
 * @version     0.0.1
 */
var mongoose = require("mongoose"),
    Schema = mongoose.Schema;



function Language (){
      this.db;


    };




Language.prototype.createConnection = function (connnectionString,callback){

    switch (arguments.length) {
        case  2:  this.db  = mongoose.createConnection(connnectionString);
            this.db.once('connected', function() {callback(true); });
            break
        case  1:  this.db  = mongoose.createConnection(connnectionString);
            break

       }
}

   Language.prototype.setLanguage = function(locale){



       var lang = new Schema({
           key   : {type : String,
               unique: true},
           value : String
       });

       try {

       this.db.model(locale, lang);
       } catch (OverwriteModelError){
          return;
       }
   };


   Language.prototype.getModelByName = function(modelName){
        try {
            return this.db.model(modelName);
        } catch (MongooseError){
           throw new Error(MongooseError);

        }

    };


   Language.prototype.getLoadedModels = function(){
       return this.db.modelNames();
   }


    Language.prototype.queryAll = function(model , callback){

        model.find({}, function(err, cb){

            if(err){
               callback(err, null);
            }

            var langObject = new Object();
            cb.forEach(function(item){
                langObject[item.key]=item.value;
            });


            try {
                langObject = JSON.stringify(langObject);

                callback(JSON.parse(langObject));

              //  callback();
            } catch (parseError) {
                callback(parseError,null);
            }

        })


    }

module.exports = Language;



