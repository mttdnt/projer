const express = require("express");
const app = express();
const request = require('request');
var rp = require('request-promise');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

const User = require('./models/User');
const Project = require('./models/Project');
const Epic = require('./models/Epic');
const Team = require('./models/Team');
const Story = require('./models/Story');

const uri = "mongodb://localhost/prtool";
const PORT = 5000;

mongoose.connect(uri);

app.use((err, req, res, next) => {
    res.status(500).json({ err: err.toString() });
    res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, db, collection, id");
	next();
});

app.use(bodyParser.json());

app.use('/user', require('./api/users'));
app.use('/project', require('./api/projects'));
app.use('/epic', require('./api/epics'));
app.use('/story', require('./api/stories'));
app.use('/team', require('./api/teams'));


app.post("/jira/getStories", async (req, res, next) =>  {

    let options = {rejectUnauthorized: false,
        uri: "",
        method: 'GET',
        auth: {'user': '',
        'pass': ''}
    };

    const { email , password, project } = req.body;



    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            try{    
                options.auth = {'user': email, 'pass': password}
                options.uri = "https://mehran-development.atlassian.net/rest/api/2/search?jql=project%3D%22"+project+"%22%20AND%20issuetype%3D%22Story%22&"+"fields=key,resolutiondate,customfield_10006,customfield_10500,customfield_10200";
                let result = await rp(options);
                result = JSON.parse(result);
                result = result["issues"];
                res.status(200).send(result)
            }catch(e){
                next(e)
            }
        }else{
            next(new Error("Unauthorized"));
        }
    }catch(e){
        next(e)
    }

});


app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
  })
