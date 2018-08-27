const express = require('express');
const Router = express.Router;
const router = Router();
var rp = require('request-promise');
const User = require('../models/User');
const Project = require('../models/Project');
const Epic = require('../models/Epic');
const Story = require('../models/Story');

router.post("/deleteStories", async (req, res, next) =>  {

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

router.post("/setStories", async (req, res, next) =>  {

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
            options.uri = findProject.project_url+"/rest/api/2/search?jql=%22Epic%20Link%22%3D"+epic+"&fields=*all";
                
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
                    team: result[i]["fields"][findProject.team_field].value,
                    points: result[i]["fields"][findProject.storyPoint_field]
                });

                story_doc = await newStory.save();

                stories.push(story_doc._id);
                epicPoints = epicPoints +  Number(result[i]["fields"][findProject.storyPoint_field]);
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

module.exports = router;

