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

const uri = "mongodb://localhost:27017/prtool";
const PORT = 5000;

mongoose.connect(uri);

app.use((err, req, res, next) => {
    res.status(500).json({ err: err.toString() });
    res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, db, collection, id");
	next();
});

app.use(bodyParser.json());

/* User Endpoints */ 

app.post("/user/login", async (req, res, next) => {

    let options = {rejectUnauthorized: false,
        uri: "",
        method: 'GET',
        auth: {'user': '',
        'pass': ''}
    };

    const { email , password } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){
            res.status(200).json(user);
        }else{  
            options.auth = {'user': email, 'pass': password}
            options.uri = "https://mehran-development.atlassian.net/rest/api/2/myself";

            const result = await rp(options);

            const new_user = new User({
                email: email,
                password: password
            });

            const doc = await new_user.save();
            res.status(200).send(doc);
            
        }

    }catch(e){
        next(e)
    }
});

/* Project Endpoints */ 

app.post("/project/getProject", async (req, res, next) =>  {

    const { email , password, project } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project}).populate('teams').populate({path: 'epics' , populate: {path: "stories"}});

            res.status(200).send(project_doc);

        }else{
            next (new Error('Unauthorized'));
        }
    }catch(e){
        next(e)
    }
});

app.post("/project/setProject", async (req, res, next) =>  {

    const { email , password, project } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project});

            if(project_doc){
                res.status(200).send(project_doc);
            }else{  

                const new_project = new Project({
                    user_id: user._id,
                    project_key: project
                });
        
                const doc = await new_project.save();

                const userDoc = await User.findOneAndUpdate({email: email}, {"$push": {"projects": doc._id}});
                res.status(200).send(doc);
            }   
        }else{
            next (new Error('Unauthorized'));
        }
    }catch(e){
        next(e)
    }
});

app.post("/project/setSprintsTeams", async (req, res, next) =>  {

    const { email , password, project, sprints } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project})

            if(project_doc){

                let team_doc = await Team.find({user_id: user._id, project_id: project_doc._id});

                let teams = [];

                for(let i=0; i<team_doc.length; i++){
                    teams.push(team_doc[i]._id);
                }

               const doc = await Project.findOneAndUpdate({ user_id: user._id, project_key: project }, { sprints: sprints, teams: teams});
               res.status(200).json({doc});

            }else{
                next (new Error('Project Not Found'));
            }
            
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

/* Epic Endpoints */ 

app.post("/epic/deleteEpics", async (req, res, next) =>  {

    const { email , password, project } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project});

            const deleted_docs = await Epic.deleteMany({project_id: project_doc._id});

            res.status(200).send({message: "success"});
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

app.post("/epic/setEpics", async (req, res, next) =>  {

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

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            options.auth = {'user': email, 'pass': password}
            options.uri = "https://mehran-development.atlassian.net/rest/api/2/search?jql=project%3D%22"+project+"%22%20AND%20issuetype%3D%22Epic%22&"+"fields=*all";
                
            let result = await rp(options);
    
            result = JSON.parse(result);
            result = result["issues"];
    
            let epics = [];
    
            for(let i=0; i<result.length; i++){
                let newEpic = new Epic({
                    project_id: findProject._id,
                    epic_key: result[i]["key"],
                    summary: result[i]["fields"].summary,
                    priority: 0,
                    team: result[i]["fields"]["customfield_10500"].value
                });

                epicDoc = await newEpic.save();

                epics.push(epicDoc._id);
            }

            const doc = await Project.findOneAndUpdate({user_id: user._id, project_key: project}, {epics: epics}, {new: true}).populate('epics');

            if(doc){
                res.status(200).send(doc);
            }else{
                next (new Error('Error Updating Selected Project'));
            }
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

app.post("/epics/updatePriority", async (req, res, next) =>  {


    const { email , password, project, priority, epicid } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            if(findProject){

                const epic_doc = await Epic.findByIdAndUpdate({_id: epicid}, {priority: priority});

                res.status(200).send(epic_doc);
                
            }else{
                next (new Error('Project unavailable'));
            }
        }else{
            next(new Error("Unauthorized"));
        }
    }catch(e){
        next(e)
    }

});


/* Story Endpoints */ 

app.post("/stories/deleteStories", async (req, res, next) =>  {

    const { email , password, project } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project});

            const deleted_docs = await Story.deleteMany({project_id: project_doc._id});

            res.status(200).send({message: "success"});
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

app.post("/stories/setStories", async (req, res, next) =>  {

    let options = {rejectUnauthorized: false,
        uri: "",
        method: 'GET',
        auth: {'user': '',
        'pass': ''}
    };

    const { email , password, project, epic } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            options.auth = {'user': email, 'pass': password}
            options.uri = "https://mehran-development.atlassian.net/rest/api/2/search?jql=%22Epic%20Link%22%3D"+epic+"&fields=*all";
                
            let result = await rp(options);
    
            result = JSON.parse(result);
            result = result["issues"];
    
            let stories = [];
            let epicPoints = 0;
    
            for(let i=0; i<result.length; i++){
                let newStory = new Story({
                    project_id: findProject._id,
                    epic_key: epic,
                    story_key: result[i]["key"],
                    summary: result[i]["fields"].summary,
                    team: result[i]["fields"]["customfield_10500"].value,
                    points: result[i]["fields"]["customfield_10200"]
                });

                story_doc = await newStory.save();

                stories.push(story_doc._id);
                epicPoints = epicPoints +  Number(result[i]["fields"]["customfield_10200"]);
            }


            const doc = await Epic.findOneAndUpdate({project_id: findProject._id, epic_key: epic}, {stories: stories, points: epicPoints}).populate('stories');

            if(doc){
                res.status(200).send(doc);
            }else{
                next (new Error('Error Updating Selected Project'));
            }
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

/* Team Endpoints */ 

app.post("/teams/deleteTeams", async (req, res, next) =>  {

    const { email , password, project, teamName, numberSprints } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            if(findProject){
                const findTeams = await Team.deleteMany({user_id: user._id, project_id: findProject._id});
                res.status(200).json({message: 'complete'});
            }else{
                next (new Error('Project unavailable'));
            }
        }else{
            next(new Error("Unauthorized"));
        }
    }catch(e){
        next(e)
    }

});

app.post("/teams/setTeams", async (req, res, next) =>  {

    let options = {rejectUnauthorized: false,
        uri: "",
        method: 'GET',
        auth: {'user': '',
        'pass': ''}
    };

    const { email , password, project, sprints } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            if(findProject){

                options.auth = {'user': email, 'pass': password}
                options.uri = "https://mehran-development.atlassian.net/rest/api/2/issue/createmeta?projectKeys="+project+"&issuetypeNames=Epic&expand=projects.issuetypes.fields";
                    
                let result = await rp(options);
                result = JSON.parse(result);
                result = result["projects"][0]["issuetypes"][0]["fields"]["customfield_10500"]["allowedValues"];

                for(let i=0; i<result.length; i++){
                    const new_team = new Team({
                        user_id: user._id,
                        name: result[i]["value"],
                        project_id: findProject._id,
                        capacities: sprints
                    });
        
                    let doc = await new_team.save();
                }

                let teamDoc = await Team.find({user_id: user._id, project_id: findProject._id});

                res.status(200).send(teamDoc);
                
            }else{
                next (new Error('Project unavailable'));
            }
        }else{
            next(new Error("Unauthorized"));
        }
    }catch(e){
        next(e)
    }

});

app.post("/teams/updateCapacities", async (req, res, next) =>  {


    const { email , password, project, teamid, capacities } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            if(findProject){

                const team_doc = await Team.findByIdAndUpdate({_id: teamid}, {capacities: capacities});

                res.status(200).send(team_doc);
                
            }else{
                next (new Error('Project unavailable'));
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
