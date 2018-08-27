const express = require('express');
const Router = express.Router;
const router = Router();
var rp = require('request-promise');
const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');

router.post("/getProject", async (req, res, next) =>  {

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

router.post("/setProject", async (req, res, next) =>  {

    const { email , password, project, url, team, parentEpic, storyPoint, sprints, weeks } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project});

            if(project_doc){
                next (new Error('Project Exists'));
            }else{  

                const new_project = new Project({
                    user_id: user._id,
                    project_key: project,
                    team_field: team,
                    project_url: url,
                    parentEpic_field: parentEpic,
                    storyPoint_field: storyPoint,
                    sprintNumber: sprints,
                    weekNumber: weeks
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

router.put("/fields", async (req, res, next) =>  {

    const { email , password, project, team, parentEpic, storyPoint } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const doc = await Project.findOneAndUpdate({user_id: user._id}, {team_field: team, parentEpic_field: parentEpic, storyPoint_field: storyPoint}); 

            res.status(200).send(doc);
             
        }else{
            next (new Error('Unauthorized'));
        }
    }catch(e){
        next(e)
    }
});

router.post("/setSprintsTeams", async (req, res, next) =>  {

    const { email , password, project, sprints, sprintNumber, weekNumber } = req.body;

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

               const doc = await Project.findOneAndUpdate({ user_id: user._id, project_key: project }, { sprints: sprints, teams: teams, sprintNumber: sprintNumber, weekNumber: weekNumber});
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

router.post("/setBurndown", async (req, res, next) =>  {

    const { email , password, project,  burndown } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project})

            if(project_doc){

               const doc = await Project.findOneAndUpdate({ user_id: user._id, project_key: project }, { burndown: burndown});
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

module.exports = router;

