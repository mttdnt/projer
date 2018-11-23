import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Card, Icon, Preloader } from 'react-materialize';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import { LineChart, Line, YAxis, XAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import moment from 'moment';
import Dropdown from 'react-dropdown';

class Reports extends Component { 

    constructor(props){
        super(props);

        this.state = {
            burndown: null,
            loading: true,
            actualBurndown: null,
            options: null,
            currentFilter: 'All',
            currentSprint: null,
            sprints: null,
            teams: null,
            team: null,
            storyPoint: null,
            parentEpic: null
        }
    }

    componentDidMount(){
        this.getProject();
    }

    getProject = async () => {
        try{
            const response = await axios.post(process.env.REACT_APP_API+"/project/getProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            let teams = response.data.teams.map(team => {
                return team.name;
            });

            teams.push('All');
    
            this.setState({
                burndown: response.data.burndown,
                sprints: response.data.sprints,
                teams: response.data.teams,
                options: teams,
                team: response.data.team_field,
                storyPoint: response.data.storyPoint_field,
                parentEpic: response.data.parentEpic_field
            }, ()=>this.getUpdates());
        }catch(e){
            console.error(e);
        }
    }

    getUpdates = async() =>{
        try{
            const response = await axios.post(process.env.REACT_APP_API+"/jira/getStories",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            let burndown = {};
            this.state.sprints.map( (sprint) =>{
                burndown[sprint.name] = {};
                this.state.teams.map( (team) =>{
                    burndown[sprint.name][team.name] = [];
                })
            });

            response.data.map( (issue) =>{
                if(issue.fields.resolutiondate!==null){
                    let sprint = this.checkSprint(issue.fields.resolutiondate);
                    if(sprint.name!==null){
                        if(burndown[sprint.name][issue.fields[this.state.team].value])
                        burndown[sprint.name][issue.fields[this.state.team].value].push({amount: issue.fields[this.state.storyPoint], epic: issue.fields[this.state.parentEpic]});
                    } 
                }
            });
            this.setState({actualBurndown: burndown}, ()=>this.getCurrentSprint());
        }catch(e){
            console.error(e);
        }
    }

    getCurrentSprint(){
        let currentDate =this.formatDate(moment());
        this.setState({loading: false, currentSprint: this.checkSprint(currentDate)});
    }

    formatDate = (date) =>{
        let d = new Date(new Date(date).toISOString());
        d.setHours(0,0,0,0);
        return d;
    }

    checkSprint = (date) =>{
        let sprint = sprint = this.state.sprints[0];
        for(let i=0; i<this.state.sprints.length; i++){
            let d1 = this.formatDate(this.state.sprints[i].start);
            let d2 = this.formatDate(date);
            let d3 = this.formatDate(this.state.sprints[i].end);
            d3.setDate(d3.getDate()+6);

            console.log(this.state.sprints[i])
            
            if(d1 <= d2 && d2 < d3){
                sprint = this.state.sprints[i];
                break;
            }
        }

        return sprint;
    }

    formatData = () => {
        if(this.state.burndown!==null && this.state.actualBurndown!==null){
            let filteredBurndown = null;
            let filteredActualBurndown = null;
            if(this.state.currentFilter!=='All'){
                filteredBurndown = {};
                filteredActualBurndown = {};
                Object.keys(this.state.burndown).forEach( sprint =>{
                    filteredBurndown[sprint] = Object.keys(this.state.burndown[sprint])
                        .filter(team => team===this.state.currentFilter)
                        .reduce((obj, team)=>{
                            obj[team] = this.state.burndown[sprint][team];
                            return obj;
                        }, {});
                    filteredActualBurndown[sprint] = Object.keys(this.state.burndown[sprint])
                        .filter(team => team===this.state.currentFilter)
                        .reduce((obj, team)=>{
                            obj[team] = this.state.actualBurndown[sprint][team];
                            return obj;
                    }, {});
               });
            }else{
                filteredBurndown = this.state.burndown;
                filteredActualBurndown = this.state.actualBurndown;
            }

            let formattedData = [];
            Object.keys(filteredBurndown).map( (sprint, index) => {
                let total = 0;
                let actual = 0;
                Object.keys(filteredBurndown[sprint]).map( team => {
                    filteredBurndown[sprint][team].map( burn => {
                        total = total+burn.amount;
                    });
                });
                Object.keys(filteredActualBurndown[sprint]).map( team => {
                    filteredActualBurndown[sprint][team].map( burn => {
                        actual = actual+burn.amount;
                    });
                });

                if(index!==0){
                    total=total+formattedData[index-1].points;
                    if(this.formatDate(this.state.sprints[index].start) >= this.formatDate(this.state.currentSprint.end)){
                        actual=null;
                    }else{
                        actual=actual+formattedData[index-1].actual;
                    }   
                }
                formattedData.push({name: sprint, points: total, actual: actual});
            });

            return(formattedData);
        }
    }

    checkForEpic = (epic) =>{
        let sprintBurn = this.state.actualBurndown[this.state.currentSprint.name];
        let amount = 0;
        Object.keys(sprintBurn).forEach(team =>{
            sprintBurn[team].forEach(burn=>{
                if(burn.epic === epic){
                    amount = amount+burn.amount;
                }
            });
        });
        return amount;
    }

    renderDeliveredEpics = () => {
        const epics = this.state.burndown[this.state.currentSprint.name];
        if(this.state.currentFilter==='All'){
            return Object.keys(epics).map(team =>{
                return epics[team].map(epic =>{
                    return(
                        <tr>
                            <td>{epic.epic}</td> 
                            <td>{team}</td> 
                            <td>{epic.amount}</td>
                            <td>{epic.amount-this.checkForEpic(epic.epic)}</td>
                        </tr>
                    ); 
                });
            });
        }else{
            return epics[this.state.currentFilter].map(epic =>{
                return(
                    <tr>
                        <td>{epic.epic}</td> 
                        <td>{this.state.currentFilter}</td> 
                        <td>{epic.amount}</td>
                        <td>{epic.amount-this.checkForEpic(epic.epic)}</td>
                    </tr>
                ); 
            });
        }
    }

    changeFilter = (e) => {
        this.setState({currentFilter: e.value});
    }

    render() {
        if(this.state.loading){
            return <div  style={styles.loader}><Preloader size='big'/></div>
        }

        if( (this.state.burndown===undefined||this.state.burndown===null)  && !this.state.loading){
            return(
                <div className="App">  
                    <Card style={styles.capacityTable}>
                        <h3>No Burndown Available</h3>
                        <Button style={styles.backBtn} className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
                    </Card>
                </div>
            );
        }
         
        return (
        <div className="App">  
            <Card style={styles.capacityTable}>
                <h3>{this.props.project} Status for {this.state.currentSprint.name} </h3>
                <div style={styles.dropdown}>
                    <h5>Filter</h5>
                    <Dropdown options={this.state.options} placeholder="Filter by Team" onChange={this.changeFilter} value={this.state.currentFilter}/>
                </div>
                <span style={styles.reportDisplay}>
                    <div style={styles.dataDisplay}>
                        <h5>Burnup</h5>
                        <ResponsiveContainer height={300} width="80%">
                            <LineChart data={this.formatData()}>
                                <CartesianGrid />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Line name="Planned" type="monotone" dataKey="points" stroke="#8884d8" />
                                <Line name="Actual" type="monotone" dataKey="actual" stroke="#82ca9d" />
                                <Legend />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={styles.dataDisplay}>
                        <h5>Epics to be delivered in {this.state.currentSprint.name}</h5>
                        <div style={styles.epicDisplay}>
                            <table>
                                <thead>
                                    <tr>
                                        <td>Epic</td>
                                        <td>Team</td>
                                        <td>Planned</td>
                                        <td>Remaining</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderDeliveredEpics()}
                                </tbody>
                            </table>
                        </div>
                    </div>   
                </span>
                <Button style={styles.backBtn} className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
            </Card>
        </div>
        );
    }
}

export default Reports;

const styles = {
    loader: {
        "position": "absolute",
        "top": "50%",
        "left": "50%"
    },
    backBtnLink: {
        "color": "#FFFFFF"
    },
    capacityTable: {
        "width": "90%",
        "position": "absolute",
        "left": "5%",
        "marginTop": "1rem",
        "textAlign": "center"    
    },
    reportDisplay: {
        "display": "-webkit-box"
    },
    dataDisplay: {
        "width": "50%"
    },
    epicDisplay: {
        "maxHeight": "300px",
        "overflow-y": "scroll"
    },
    dropdown: {
        "width": "25%"
    },
    backBtn: {
        "position": "absolute",
        "top": "0",
        "left": "0"
    }
};