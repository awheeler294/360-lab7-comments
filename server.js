var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";
http.createServer(function (request, response) {
   var urlObj = url.parse(request.url, true, false);
   
   // getCity route
   if (urlObj.pathname.indexOf("getcity") != -1) {
      //console.log("In Getcity");
      fs.readFile("cities.dat.txt", function (err, data) {
         if (err) {
            throw err;
         }
         else {
            var cities = data.toString().split("\n");
            // for(var i = 0; i < cities.length; i++) {
            //    console.log(cities[i]);
            // }
            var myRe = new RegExp("^" + urlObj.query["q"], "i");
            // console.log(myRe);
            var jsonresult = [];
            for(var i = 0; i < cities.length; i++) {
               // console.log("city:   " + cities[i]);
               var result = cities[i].search(myRe);
               // console.log("result: " + result);
               // console.log(""); 
               if(result != -1) {
                  // console.log(cities[i]);
                  jsonresult.push({city:cities[i]});
               } 
            }   
            // console.log(jsonresult);

            // console.log(JSON.stringify(jsonresult));
            response.writeHead(200);
            response.end(JSON.stringify(jsonresult));
         }
      });
      
   }

   // comments REST service
   else if(urlObj.pathname.indexOf("comment") !=-1) {
      console.log("comment route");
      if(request.method === "POST") {
         
         console.log("POST comment route");
         // First read the form data
         var jsonData = "";
         
         request.on('data', function (chunk) {
            jsonData += chunk;
         });
         
         request.on('end', function () {
            var reqObj = JSON.parse(jsonData);
            console.log(reqObj);
            console.log("Name: " + reqObj.Name);
            console.log("Comment: " + reqObj.Comment);

            // Now put it into the database
            var MongoClient = require('mongodb').MongoClient;
            MongoClient.connect("mongodb://localhost/weather", function(err, db) {
               if(err) throw err;
               db.collection('comments').insert(reqObj,function(err, records) {
                  console.log("Record added as " + records[0]._id);
               });
               response.writeHead(200);
               response.end("");
            });
         });

      } else if(request.method === "GET") {
        
         console.log("In GET");
         // Read all of the database entries and return them in a JSON array
         var MongoClient = require('mongodb').MongoClient;
         MongoClient.connect("mongodb://localhost/weather", function(err, db) {
       
            if(err) throw err;
            db.collection("comments", function(err, comments){
          
               if(err) throw err;
               comments.find(function(err, items){
                  items.toArray(function(err, itemArr){
                  
                     console.log("Document Array: ");
                     console.log(itemArr);
                     
                     response.writeHead(200);
                     response.end(JSON.stringify(itemArr));
                  });
               
               });
            
            });
         
         });
      }
   }

   //other HTTP
   else {
      fs.readFile(ROOT_DIR + urlObj.pathname, function (err, data) {
         if (err) {
            response.writeHead(404);
            response.end(JSON.stringify(err));
            return;
         }
         response.writeHead(200);
         response.end(data);
      });
   }
}).listen(80);
