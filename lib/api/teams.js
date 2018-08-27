const express = require('express');
const Router = express.Router;
const router = Router();
var rp = require('request-promise');
const User = require('../models/User');
const Project = require('../models/Project');
const Epic = require('../models/Epic');
const Team = require('../models/Team');

router.post("/deleteTeams", async (req, res, next) =>  {

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

router.post("/setTeams", async (req, res, next) =>  {

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
                options.uri = findProject.project_url+"/rest/api/2/issue/createmeta?projectKeys="+project+"&issuetypeNames=Epic&expand=projects.issuetypes.fields";
                    
                let result = await rp(options);
                result = JSON.parse(result);
                result = result["projects"][0]["issuetypes"][0]["fields"][findProject.team_field]["allowedValues"];

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

router.post("/updateCapacities", async (req, res, next) =>  {


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

module.exports = router;

