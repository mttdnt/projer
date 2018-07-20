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
            <Link style={styles.iconLink} to="/dashboard">
              <Icon large>equalizer</Icon>
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
            <Link style={styles.iconLink} to="/project">
              <Icon large>replay</Icon>
            </Link>
            <div>Reset Project</div>
          </Col>

          <Col s={3}>
            <div className="logout" onClick={this.props.logout}>
              <Icon style={styles.iconLink} large>exit_to_app</Icon>
            </div>
            <div>Log Out</div>
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
