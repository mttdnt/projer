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
            currentFilter: 'None'
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

            let teams = response.data.teams.map(team => {
                return team.name;
            });

            teams.push('None');
    
            this.setState({
                burndown: response.data.burndown,
                sprints: response.data.sprints,
                teams: response.data.teams,
                options: teams
            }, ()=>this.getUpdates());
        }catch(e){
            console.error(e);
        }
    }

    getUpdates = async() =>{
        try{
            const response = await axios.post("/jira/getStories",{
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
                    if(sprint!==null){
                        burndown[sprint][issue.fields.customfield_10500.value].push({amount: issue.fields.customfield_10200, story: issue.key, epic: issue.fields.customfield_10006});
                    } 
                }
            });
            this.setState({loading: false, actualBurndown: burndown});
        }catch(e){
            console.error(e);
        }
    }

    formatDate = (date) =>{
        let d = new Date(new Date(date).toISOString().slice(0,10));
        d.setHours(0,0,0,0);
        return d;
    }

    checkSprint = (date) =>{

        let sprint = null;
        for(let i=0; i<this.state.sprints.length; i++){
            let d1 = this.formatDate(this.state.sprints[i].start);
            let d2 = this.formatDate(date);
            let d3 = this.formatDate(this.state.sprints[i].start);
            d3.setDate(d3.getDate()+6);
            
            if(d1 <= d2 && d2 <=  d3){
                sprint = this.state.sprints[i].name;
                break;
            }
        }

        return sprint;
    }

    formatData = () => {
        if(this.state.burndown!==null && this.state.actualBurndown!==null){
            let filteredBurndown = null;
            let filteredActualBurndown = null;
            if(this.state.currentFilter!=='None'){
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
                    actual=actual+formattedData[index-1].actual;
                }
                formattedData.push({name: sprint, points: total, actual: actual});
            });

            return(formattedData);
        }
    }

    changeFilter = (e) => {
        this.setState({currentFilter: e.value});
    }

    render() {
        if(this.state.loading){
            return <div  style={styles.loader}><Preloader size='big'/></div>
        }
         
        return (
        <div className="App">  
            <Card style={styles.capacityTable}>
                <h3>{this.props.project} Burndown</h3>
                <Dropdown options={this.state.options} placeholder="Filter by Team" onChange={this.changeFilter} value={this.state.currentFilter}/>
                <ResponsiveContainer height={300} width="100%">
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
                <Button className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
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
        "color": "#FFFFFF",
    },
    capacityTable: {
        "width": "90%",
        "position": "absolute",
        "left": "5%",
        "marginTop": "1rem",
        "overflowX": "scroll", 
        "textAlign": "center"    
    },
    header: {
        "margin": "0"
    }
};