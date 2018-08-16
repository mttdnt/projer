import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Card, Table, Icon} from 'react-materialize';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Burndown extends Component { 

    constructor(props){
        super(props);

        this.state = {
            epics: null,
            teams: null,
            loading: true,
            burndown: null
        }
    }

    componentDidMount(){
        this.getProject();
    }

    getProject = async () => {

        try{
            const response = await axios.post("http://localhost:5000/project/getProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });
            
            this.setState({epics: JSON.parse(JSON.stringify(response.data.epics)), teams: JSON.parse(JSON.stringify(response.data.teams))});
            this.burndown(JSON.parse(JSON.stringify(response.data.epics)), JSON.parse(JSON.stringify(response.data.teams)), JSON.parse(JSON.stringify(response.data.sprints)));
        }catch(e){
            console.error(e);
        }
    }

    setBurndown = async () => {
        try{
            for(let i=0; i<this.state.teams.length; i++){
                let response = await axios.post("http://localhost:5000/project/setBurndown",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.props.project,
                    burndown: this.state.burndown
                });
            }
            this.setState({burndownSubmit: true});
        }catch(e){
            console.error(e);
        }
    }

    checkDependencies = (dependencies, epics) =>{

        let dependentEpics = [];

        dependencies.forEach(element => {
            dependentEpics = dependentEpics.concat(epics.filter(epic =>{
                return epic.epic_key === element && !epic.isFinished
            }));
        });

        if(dependentEpics.length > 0){
            return true;
        }else{
            return false;
        }
    }

    burndown = (epic, team, sprint) => {

        let epics = epic;
        epics.sort( (a, b) => {return (a.priority) - (b.priority)});
        let teams = team;
        let sprints=sprint;
        
        let burndown = {};
        sprints.map( (sprint) =>{
            burndown[sprint.name] = {};
            teams.map( (team) =>{
                burndown[sprint.name][team.name] = [];
            })
        });

        epics.forEach( item =>{
            item['isFinished'] = false;
            item['isStarted'] = false;
        });

        let started;

        for(let i=0; i<sprints.length; i++){
            started = [];
            for(let j=0; j<teams.length; j++){
                for(let k=0; k<epics.length; k++){
                    for(let z=0; z<epics[k].stories.length; z++){
                        if (Number(teams[j].capacities[sprints[i].name]) === 0){
                            break;
                        }

                        let isDependent = false;

                        if(epics[k].dependencies.length!==0){
                            isDependent = this.checkDependencies(epics[k].dependencies, epics);
                        }

                        if(!isDependent && epics[k].stories[z].team === teams[j].name && Number(epics[k].stories[z].points) !== 0){

                            if(!epics[k].isStarted && !started.includes(epics[k].epic_key)){
                                started.push(epics[k].epic_key);
                            }
                            
                            let result = Number(epics[k].stories[z].points)-Number(teams[j].capacities[sprints[i].name]);
                            let amount;
                            if(result>=0){
                                epics[k].points = Number(epics[k].points) - Number(teams[j].capacities[sprints[i].name]);
                                amount = Number(teams[j].capacities[sprints[i].name]);
                                teams[j].capacities[sprints[i].name] = 0;
                                epics[k].stories[z].points = result;
                                
                                burndown[sprints[i].name][teams[j].name].push({epic: epics[k].epic_key, amount: amount, story: epics[k].stories[z].story_key});
                            }else{
                                epics[k].points = Number(epics[k].points)-Number(epics[k].stories[z].points);
                                amount = Number(epics[k].stories[z].points);
                                teams[j].capacities[sprints[i].name] = -1*result;
                                epics[k].stories[z].points = 0;

                                burndown[sprints[i].name][teams[j].name].push({epic: epics[k].epic_key, amount: amount, story: epics[k].stories[z].story_key});
                            }
                        }

                    }
                }
            }

            epics.forEach(item => {
                if(item.points===0){
                    item['isFinished'] = true;
                }
                
                if(started.includes(item.epic_key)){
                    item['isStarted'] = true;
                }
            });
        }

        this.setState({burndown: burndown, loading: false});
    }

    renderBurndown = () =>{
        return this.state.teams.map( team => {
            return(
                <tr>
                    <td>{team.name}</td>
                    {Object.keys(this.state.burndown).map( sprint =>
                     <td>
                         {this.state.burndown[sprint][team.name].map( burn =>
                            <Card className="epicBurn">
                                <b>Epic:</b> {burn.epic}
                                <br/>
                                <b>Points:</b> {burn.amount}
                                <br/>
                                <b>Story:</b> {burn.story}
                            </Card>
                         )}
                     </td>   
                    )}
                </tr>
            );
        });
    }

    renderHeaders = () =>{
        return Object.keys(this.state.burndown).map( sprint => {
            return <td>{sprint}</td>
        });
    }

    render() {

        if(this.state.loading){
            return <div>Loading..</div>
        }

        return (
        <Card style={styles.epics}>  
            <h3 style={styles.header}>Project Burndown</h3>
            <div style={styles.burndown}>
                <Table striped={true} bordered={true}>
                    <thead>
                        <tr>
                            <td></td>
                            {this.renderHeaders()}
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderBurndown()}
                    </tbody>
                </Table>
            </div>
            <Button className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
            <Button onClick={this.setBurndown}>Save Burndown</Button>
        </Card>
        );
    }
}

export default Burndown;

const styles = {
    backBtnLink: {
        "color": "#FFFFFF",
    },
    epics: {
        "width": "90%",
        "position": "absolute",
        "left": "5%",
        "marginTop": "1rem",
        "textAlign": "center",
        "position": "relative"     
    },
    header: {
        "margin": "0"
    },
    burndown: {
        "max-height": "30rem",
        "overflow-y": "scroll",
    }
}
