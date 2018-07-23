import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Card } from 'react-materialize';
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
            const response = await axios.post("/project/getProject",{
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

    burndown = (epic, team, sprint) => {

        let epics = epic;
        epics.sort( (a, b) => {return (a.priority) - (b.priority)});
        let teams = team;
        let sprints=sprint;
        
        let burndown = {};
         sprints.map( (sprint) =>{
            burndown[sprint] = {};
            teams.map( (team) =>{
                burndown[sprint][team.name] = [];
            })
        });

        for(let i=0; i<sprints.length; i++){
            for(let j=0; j<teams.length; j++){
                for(let k=0; k<epics.length; k++){
                    for(let z=0; z<epics[k].stories.length; z++){
                        if (Number(teams[j].capacities[sprint[i]]) === 0){
                            break;
                        }
                        if(epics[k].stories[z].team === teams[j].name && Number(epics[k].stories[z].points) !== 0){
                            let result = Number(epics[k].stories[z].points)-Number(teams[j].capacities[sprint[i]]);
                            let amount;
                            if(result>=0){
                                amount = Number(teams[j].capacities[sprint[i]]);
                                teams[j].capacities[sprint[i]] = 0;
                                epics[k].stories[z].points = result;
                                epics[k].points = epics[k].points - Number(teams[j].capacities[sprint[i]]);
                                burndown[sprints[i]][teams[j].name].push({epic: epics[k].epic_key, amount: amount, story: epics[k].stories[z].story_key});
                            }else{
                                amount = Number(epics[k].stories[z].points);
                                teams[j].capacities[sprint[i]] = -1*result;
                                epics[k].stories[z].points = 0;
                                epics[k].points = epics[k].points-Number(epics[k].stories[z].points);
                                burndown[sprints[i]][teams[j].name].push({epic: epics[k].epic_key, amount: amount, story: epics[k].stories[z].story_key});
                            }
                        }

                    }
                }
            }
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
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            {this.renderHeaders()}
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderBurndown()}
                    </tbody>
                </table>
            </div>
            <Button><Link style={{"color": "#fff"}} to="/dashboard">To Dashboard</Link></Button>
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
