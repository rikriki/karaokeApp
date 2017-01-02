const exec = require('child_process').exec;
const _=  require('lodash'),
 async=  require('async'),

	mysql = require('mysql');
var  request = require('request');
var genres = [];
const connection = mysql.createConnection({
  host     : 'rosales12.cruxmj2a7oou.us-west-2.rds.amazonaws.com',
  user     : 'rikriki',
  password : 'rosales1',
  database : 'rosales12'
});

function getResults(sql,done){
  connection.query(sql,function(err,results){
    if(err) 
      done(err,null)
    
    done(null,results)
  })
}


exec('cd videos && ls',(err,stdout,stderr)=>{
    var files=stdout.split('\n')
    files = _.map(files,function(f){
        //return f.split('-').slice(0,2).join('-').concat(".",f.split('-').pop().split('.').pop());
		return f.split('-').slice(0,2).join('-')
        
    }) 
    getID(files)
})


function getID(files){
	_.each(files,function(f,i){
		
		//"SELECT * FROM `karaoke_videos` WHERE `title` LIKE 'Twenty One Pilots - Lane Boy (Karaoke Version)' ORDER BY `title` DESC"
		var sql  = "SELECT * FROM ?? WHERE title = ?";
		getResults(mysql.format(sql, ['karaoke_videos', f]), function(err,results) {
			if(err)
				console.log(err, "Error",f)	
			
			if(results && results[0]){
		    	console.log('done!', results[0].title)

				var propertiesObject = { key:'utCtCIdzPvjoTZbvxUSc',secret:'WSTwltLzcEdixSIfxXVubwyyKuZLYASZ',country:'UK', artist:results[0].title.split('-')[0],title:results[0].title.split('-')[1].split('(')[0] };
				//console.log("artist",results[0].title.split('-')[0],'title',results[0].title.split('-')[1].split('(')[0])
				request.get({headers: {'User-Agent': 'MyUserAgent/1.0','Content-Length': 0,
				},url:'https://api.discogs.com/database/search', qs:propertiesObject}, 
					function(err, response, body) {
					  if(err) { console.log(err); return; }
					   //console.log(body)
					   var foo = JSON.parse(body)
					   
					  if(!_.isEmpty(foo.results)){
					  	console.log(results[0].id)
					  	var details={
						  	videoId:results[0].id,
							genre:foo.results[0].genre,
					  	}
					  	genres.push(details)
					  	//console.log("Get response: " + JSON.stringify(details));			
					  }
					  
				 	   
					}
				);
			}else{
				// console.log(f)
			}
			
			if(i==files.length-1){
				insertGenre(genres)
				//console.log(genres,'done')
			}
		})
	})
}

function insertGenre(genres){
	var sql ="INSERT INTO karaoke_genres(videoId,type) VALUES ?";
	var values=[];
	_.each(genres,function(g,idx){
		if(g.genre.length>1){
			_.each(g.genre,function(genre,i){
				values.push(new Array(g.videoId,genre))
			})
		}else{
			values.push(new Array(g.videoId,g.genre[0]))
		}
		
		if(genres.length-1==idx){
			console.log(values," to insert")
			connection.query(sql,[values], function(err,results) {
			    if (err){
			    	console.log(err,"errrrrr");	
			    } 
			    console.log(results,"$$$$$$$")
			    connection.end();
			});

		}
			
	})

	
}