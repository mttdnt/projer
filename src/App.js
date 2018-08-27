import React, { Component } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom';
import axios from 'axios';
import { setToken, getToken, removeToken } from './services/tokenService';

import Login from "./components/Login";
import Signup from "./components/Signup";
import ProjectSetup from "./components/ProjectSetup";
import CapacityPlanner from "./components/CapacityPlanner";
import Dashboard from "./components/Dashboard";
import PriorityPlanner from "./components/PriorityPlanner";
import Burndown from "./components/Burndown";
import DependencyPlanner from "./components/DependencyPlanner";
import Reports from "./components/Reports";
import Projects from "./components/Projects"
import ProjectEdit from "./components/ProjectEdit";

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      email: null,
      password: null,
      project: null
    }

  }

  logout = () => {
    this.setState({email: null, password: null, project: null});
  }

  setUser = (email, password) =>{
    this.setState({email: email, password: password});
  }

  setProject = (project) =>{
    this.setState({project: project});
  }

  render() {
    return (
      <div> 
        <div style={styles.navbar}><span style={styles.title}>Projer</span> <span style={styles.subTitle}>By Deloitte</span> <span style={styles.project}>{this.state.project}</span></div> 
        <Router>      
          <div>
              <Route exact path='/' render={() => 
                this.state.email===null || this.state.password===null ?
                <Login setUser={this.setUser} />
                :
                <Redirect to="/projects"/>                         
              }/>
              <Route exact path='/signup' render={() => 
                this.state.email===null || this.state.password===null ?
                <Signup setUser={this.setUser} />
                :
                <Redirect to="/projects"/>                         
              }/>              
              <Route exact path='/dashboard' render={() =>
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <Dashboard setProject={this.setProject} project={this.state.project}/> 
              }/>
              <Route exact path='/setup' render={() => 
                this.state.email===null || this.state.password===null ?
                <Redirect to="/"/>
                :
                this.state.project===null?
                <ProjectSetup email={this.state.email} password={this.state.password}/>
                :
                <Redirect to='/dashboard'/>               
              }/>
              <Route exact path='/capacity' render={() => 
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <CapacityPlanner email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/priority' render={() => 
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <PriorityPlanner email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/burndown' render={() => 
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <Burndown email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/dependency' render={() => 
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <DependencyPlanner email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/edit' render={() => 
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <ProjectEdit email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/reports' render={() => 
                this.state.project===null ?
                <Redirect to="/projects"/>
                :
                <Reports email={this.state.email} password={this.state.password} project={this.state.project}/>                   
              }/>
              <Route exact path='/projects' render={() => 
                this.state.email===null || this.state.password===null ?
                <Redirect to="/"/>
                :
                this.state.project===null?
                <Projects setProject={this.setProject} email={this.state.email} password={this.state.password}/>
                :
                <Redirect to='/dashboard'/>
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
