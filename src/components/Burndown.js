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
            burndown: null, 
            sprints: null
        }
    }

    componentDidMount(){
        this.getProject();
    }

    getProject = async () => {

        try{
            const response = await axios.post("/project/getProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });
            
            this.setState({epics: JSON.parse(JSON.stringify(response.data.epics)), teams: JSON.parse(JSON.stringify(response.data.teams)), sprints: JSON.parse(JSON.stringify(response.data.sprints))});
            this.burndown(JSON.parse(JSON.stringify(response.data.epics)), JSON.parse(JSON.stringify(response.data.teams)), JSON.parse(JSON.stringify(response.data.sprints)));
        }catch(e){
            console.error(e);
        }
    }

    setBurndown = async () => {
        try{
            for(let i=0; i<this.state.teams.length; i++){
                let response = await axios.post("/project/setBurndown",{
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
                   
                    if (Number(teams[j].capacities[sprints[i].name]) === 0){
                        break;
                    }

                    let isDependent = false;

                    if(epics[k].dependencies.length!==0){
                        isDependent = this.checkDependencies(epics[k].dependencies, epics);
                    }

                    if(!isDependent && epics[k].team === teams[j].name && Number(epics[k].points) !== 0){

                        if(!epics[k].isStarted && !started.includes(epics[k].epic_key)){
                            started.push(epics[k].epic_key);
                        }
                            
                        let result = Number(epics[k].points)-Number(teams[j].capacities[sprints[i].name]);
                        let amount;
                        if(result>=0){
                            epics[k].points = result;
                            amount = Number(teams[j].capacities[sprints[i].name]);
                            teams[j].capacities[sprints[i].name] = 0;
                                
                            burndown[sprints[i].name][teams[j].name].push({epic: epics[k].epic_key, amount: amount, summary: epics[k].summary});
                        }else{
                            amount = Number(epics[k].points);
                            epics[k].points = 0;
                            teams[j].capacities[sprints[i].name] = -1*result;

                            burndown[sprints[i].name][teams[j].name].push({epic: epics[k].epic_key, amount: amount, summary: epics[k].summary});
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
                                <b>Summary:</b> {burn.summary}
                                <br/>
                                <b>Points:</b> {burn.amount}
                                <br/>
                            </Card>
                         )}
                     </td>   
                    )}
                </tr>
            );
        });
    }

    renderHeaders = () =>{
        return this.state.sprints.map( sprint => {
            let start = new Date(sprint.start);
            let end = new Date(sprint.end);
            return <td style={styles.sprintHeader}><h5>{sprint.name}</h5><div style={styles.dates}>{start.toUTCString().substring(5,16)} - {end.toUTCString().substring(5,16)}</div></td>
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
            <Button style={styles.backBtn} className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
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
    },
    backBtn: {
        "position": "absolute",
        "top": "0",
        "left": "0"
    },
    sprintHeader: {
        "textAlign": "center"
    },
    dates: {
        "fontSize": "10px"
    }
}
