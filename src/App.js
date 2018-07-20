import React, { Component } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom';
import axios from 'axios';

import Login from "./components/Login";
import ProjectPage from "./components/ProjectPage";
import CapacityPlanner from "./components/CapacityPlanner";
import Dashboard from "./components/Dashboard";
import PriorityPlanner from "./components/PriorityPlanner";
import Burndown from "./components/Burndown";

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      email: null,
      password: null,
      project: null,
      epics: null
    }

  }

  logout = () => {
    this.setState({email: null, password: null, project: null});
  }

  setUser = async (email, password, project) =>{

    try{
      const response = await axios.post("http://localhost:5000/project/getProject",{
          email: email,
          password: password,
          project: project
      });

      this.setState({email: email, password: password, project: project, epics: response.data.epics});

    }catch(e){
        console.error(e);
    }

  }

  render() {
    return (
      <div> 
        <div style={styles.navbar}><span style={styles.title}>Projer</span> <span style={styles.subTitle}>By Deloitte</span> <span style={styles.project}>{this.state.project}</span></div> 
        <Router>      
          <div>
              <Route exact path='/' render={() => 
                this.state.email===null || this.state.password===null || this.state.project===null ?
                <Login setUser={this.setUser} />
                :
                !this.state.epics?<Redirect to="/project"/>:<Redirect to="/dashboard"/> 

                                   
              }/>
              <Route exact path='/dashboard' render={() =>
                this.state.email===null || this.state.password===null || this.state.project===null ?
                <Redirect to="/"/>
                :
                <Dashboard logout={this.logout} project={this.state.project}/> 
              }/>
              <Route exact path='/project' render={() => 
                this.state.email===null || this.state.password===null || this.state.project===null ?
                <Redirect to="/"/>
                :
                <ProjectPage email={this.state.email} password={this.state.password} project={this.state.project}/>                
              }/>
              <Route exact path='/capacity' render={() => 
                this.state.email===null || this.state.password===null || this.state.project===null ?
                <Redirect to="/"/>
                :
                <CapacityPlanner email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/priority' render={() => 
                this.state.email===null || this.state.password===null || this.state.project===null ?
                <Redirect to="/"/>
                :
                <PriorityPlanner email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
                <Route exact path='/burndown' render={() => 
                this.state.email===null || this.state.password===null || this.state.project===null ?
                <Redirect to="/"/>
                :
                <Burndown email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
            </div>
        </Router>
     
      </div>
    );
  }
}

export default App;

const styles = {
  navbar: {
    "height": "5rem",
    "backgroundColor": "#000"
  },
  title: {
    "color": "#FFFFFF",
    "fontSize": "3rem",
    "margin": "0"
  },
  subTitle: {
    "color": "#FFFFFF",
  },
  project: {
    "color": "#FFFFFF",
    "fontSize": "3rem",
    "margin": "0 1rem",
    "float": "right"
  }
};
