const loki = require('lokijs');

module.exports = {
    getInstance: () => Singleton.getInstance(),

}

var Singleton = (function (){

    var instance;
    function databaseInitialize() {
        console.log("IAM BEING INITIALLLASL");
        var sessions = db.getCollection("sessions");

        var config = db.getCollection("config");

        if (sessions === null){
            sessions =  db.addCollection ("sessions");
        }
        if (config === null){
            config = db.addCollection ("config");
            config.insert({canRecord : false});
        }
    }

    function createInstance() {
        var db = new loki('festival.db',{
            autosave: true,
            autosaveInterval: 2000 // save every four seconds for our example
        });

        var sessions = db.getCollection("sessions");

        var config = db.getCollection("config");

        if (sessions === null){
            sessions =  db.addCollection ("sessions");
        }
        if (config === null){
            config = db.addCollection ("config");
            config.insert({type : 'canRecord' , value: false});
            config.insert({type : 'currentMicSession' , value: null});
        }


        return db;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

