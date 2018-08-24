import React, { Component } from 'react';
import '../App.css';
import {Link} from 'react-router-dom';
import { Button, Card, Icon, Row, Col } from 'react-materialize';

class Dashboard extends Component {

  render() {
    return (
      <Card style={styles.card}>
        <Row>
          <Col s={3}>
            <Link style={styles.iconLink} to="/capacity">
              <Icon large>group</Icon>
            </Link>
            <div>Capacity Planner</div>
          </Col>

          <Col s={3}>  
            <Link style={styles.iconLink} to="/priority">
              <Icon large>error</Icon>
            </Link>
            <div>Priority Planner</div>
          </Col>

          <Col s={3}>
            <Link style={styles.iconLink} to="/dependency">
              <Icon large>device_hub</Icon>
            </Link>
            <div>Dependency Planner</div>
          </Col>

          <Col s={3}>
            <Link style={styles.iconLink} to="/burndown">
              <Icon large>whatshot</Icon>
            </Link>
            <div>Epic Burndown</div>
          </Col>

          <Col s={3}>
            <Link style={styles.iconLink} to="/edit">
              <Icon large>replay</Icon>
            </Link>
            <div>Edit Project Settings</div>
          </Col>

          <Col s={3}>
            <Link style={styles.iconLink} to="/reports">
              <Icon large>equalizer</Icon>
            </Link>
            <div>Current Report</div>
          </Col>

          <Col s={3}>
            <div className="logout" onClick={() =>{this.props.setProject(null)}}>
              <Icon style={styles.iconLink} large>exit_to_app</Icon>
            </div>
            <div>Select Project</div>
          </Col>
        </Row>
      </Card>
    );
  }
}

export default Dashboard;

const styles = {
  card: {
    "textAlign": "center",
    "width": "80%",
    "position": "absolute",
    "left": "10%",
    "marginTop": "5rem",
  
  },
  iconLink: {
    "color": "#000"
  }
};
