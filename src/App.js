import React, { Component } from 'react';
import './App.css';
import {Form, FormGroup, Col, ControlLabel, Button, FormControl, Label} from 'react-bootstrap'
import jsonFetch from 'json-fetch'
import styled from 'styled-components';
import {Typeahead} from 'react-bootstrap-typeahead';
import { Marker } from "react-geo-maps";
import SweetAlert from 'sweetalert2-react';


const GOOGLE_MAPS_API_KEY = 'AIzaSyBfhgerK2UXR5QHjZfRBilsuTnf5R-3bhU'

const Container = styled.div`
  padding: 2vh 2vw;
  height: 100vh;
  h1 {
    text-align:center;
    margin-bottom: 5vh;
  }
  h3 {
    text-align: center;
  }
  ::after {
    content: "";
    background: url('/image.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    opacity: 0.15;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    z-index: -1;

  }
  font-family: 'Oxygen', sans-serif;
  .label-default {
      opacity: 0.5;
      position: absolute;
      top: .5vh;
      right: .5vh;
    }
`;

const TypeAhead = styled(Typeahead)`
  width: 90vw;
  margin: auto;
  margin-top: 20vh;
`

const BackButton = styled(Button)`
  &.btn-default{
    background-image: none;
    padding: 0.25em;
    position: absolute;
    top: .5vh;
  }
`

class App extends Component {
  constructor(props) {
    super(props)
    const isAdmin = window.location.href.toLowerCase().includes('admin')
    this.state = {view: 'intro', list:false, isAdmin: isAdmin, secure:false} //intro, list, detail, edit
    this.isLoggedIn()
  }

  getSoldiers = () => {
    jsonFetch('/soldiers', {
      expectedStatuses: [200], // rejects "FetchUnexpectedStatusError" on unexpected status (optional)
      // supports all normal json-fetch options:
      credentials: 'include',
      method: 'GET',
    })
    .then((response) => {
      // handle response with expected status:
      this.setState({list: response.body.map(o => Object.assign(o, {label: `${o.firstName} ${o.lastName}`}))}) // json response here
      //console.log(response.status)
      //console.log(response.statusText)
      //console.log(response.headers)
    })
    .catch((err) => {
      // handle response with unexpected status:
      console.log(err.name)
      console.log(err.message)
      console.log(err.response.status)
      console.log(err.response.statusText)
      console.log(err.response.body)
      console.log(err.response.text)
      console.log(err.response.headers)
    })
  }

  putSoldier = () => {
    this.setState({isPosting: true}, 
      () => jsonFetch('/soldiers', {
        expectedStatuses: [200], // rejects "FetchUnexpectedStatusError" on unexpected status (optional)
        // supports all normal json-fetch options:
        credentials: 'include',
        body: this.state.soldier,
        method: 'POST',
      })
      .then((response) => {
        let newSoldier = JSON.parse(JSON.stringify(this.state.soldier))
        newSoldier._rev = response.body.rev
        newSoldier._id = response.body.id
        this.setState({isPosting: false, list: false, soldier: newSoldier, confirm: true})
      })
      .catch((err) => {
        // handle response with unexpected status:
        console.log(err.name)
        console.log(err.message)
        console.log(err.response.status)
        console.log(err.response.statusText)
        console.log(err.response.body)
        console.log(err.response.text)
        console.log(err.response.headers)
      })
    )
  }

  deleteSoldier = () => {
    this.setState({isPosting: true}, 
      () => jsonFetch('/soldiers', {
        expectedStatuses: [200], // rejects "FetchUnexpectedStatusError" on unexpected status (optional)
        // supports all normal json-fetch options:
        credentials: 'include',
        body: this.state.soldier,
        method: 'DELETE',
      })
      .then((response) => {
        this.setState({isPosting: false, list: false, confirm: true})
      })
      .catch((err) => {
        // handle response with unexpected status:
        console.log(err.name)
        console.log(err.message)
        console.log(err.response.status)
        console.log(err.response.statusText)
        console.log(err.response.body)
        console.log(err.response.text)
        console.log(err.response.headers)
      })
    )
  }



  login = () => {
    this.setState({isPosting: true, secure: false, loginFail: false}, 
      () => jsonFetch('/login', {
        expectedStatuses: [200], // rejects "FetchUnexpectedStatusError" on unexpected status (optional)
        // supports all normal json-fetch options:
        credentials: 'include',
        body: {u: this.state.user, p: this.state.password},
        method: 'POST',
      })
      .then((response) => {
        if (response.body.ok) {
          this.setState({isPosting: false, secure: true, loginFail: false})
        } else {
          this.setState({isPosting: false, secure: false, loginFail: true})
        }
      })
      .catch((err) => {
        // handle response with unexpected status:
        this.setState({isPosting: false, secure: false, loginFail: true})
      })
    )
  }

  isLoggedIn = () => {
    jsonFetch('/login', {
      expectedStatuses: [200], // rejects "FetchUnexpectedStatusError" on unexpected status (optional)
      // supports all normal json-fetch options:
      credentials: 'include',
      method: 'GET',
    })
    .then((response) => {
      // handle response with expected status:
      this.setState({secure: response.body.ok}) // json response here
      //console.log(response.status)
      //console.log(response.statusText)
      //console.log(response.headers)
    })
    .catch((err) => {
      // handle response with unexpected status:
      console.log(err.name)
      console.log(err.message)
      console.log(err.response.status)
      console.log(err.response.statusText)
      console.log(err.response.body)
      console.log(err.response.text)
      console.log(err.response.headers)
    })
  }

  newSolider = () => {
    this.setState({
      view: 'detail',
      soldier: {
        firstName: '',
        lastName: '',
        branch: '',
        conflict: '',
        geo: {
          latitude: 0,
          longitude: 0
        },
        rank: '',
        type: '',
      }
    })
  }

  detail = (soldier) => {
    this.setState({view: 'detail', soldier: soldier[0]})
  }

  getGeoLocation = () => {
    this.setState({isLocating: true},
      navigator.geolocation.getCurrentPosition(
        position => {
          let newSoldier = {...this.state.soldier, geo: {latitude: position.coords.latitude, longitude: position.coords.longitude}}
          this.setState({soldier: newSoldier, isLocating: false})
        }
      )
    )
    
  }

  render() {
    window.scrollTo(0,0);
    //intro view
    if (this.state.view === 'intro') {
      if (!this.state.list) this.getSoldiers() //need list of soldiers in order to present typahead
      if (!this.state.isAdmin) {
        return (
          <Container>
            <h1>Find My Soldier</h1>
            
            {this.state.list ?
              <TypeAhead
              onChange={this.detail}
              options={this.state.list}
              placeholder='Search by Name'
            />
            : <span>loading...</span>}
          </Container>
        )
      } else { //ADMIN
        if (!this.state.secure) {
          return (
            <Container>
              <h1>Find My Soldier </h1>
              <h3><Label>ADMIN</Label></h3>
              <Form horizontal style={{marginTop: '20vh'}}>
              <FormGroup validationState = {this.state.loginFail ? 'error' : null}>
                <Col componentClass={ControlLabel} xs={3}>
                  User
                </Col>
                <Col xs={9}>
                  <FormControl
                    type="text"
                    onChange={ e => {
                      this.setState({user: e.target.value})
                    }}
                  />
                </Col>
              </FormGroup>
              <FormGroup validationState = {this.state.loginFail ? 'error' : null}>
                <Col componentClass={ControlLabel} xs={3}>
                  Password
                </Col>
                <Col xs={9}>
                  <FormControl
                    type="text"
                    onChange={ e => {
                      this.setState({password: e.target.value})
                    }}
                  />
                </Col>
              </FormGroup>
              </Form>
              <Button onClick = { this.login }> Login </Button>
            </Container>)
        } else {
          return (
            <Container>
              <h1>Find My Soldier</h1>
              <h3><Label>ADMIN</Label></h3>
              {this.state.list ?
                <TypeAhead
                onChange={this.detail}
                options={this.state.list}
                placeholder='Search by Name'
              />
              : <span>loading...</span>}
              <Button style={{display: 'block', margin: 'auto', marginTop: '1em'}} onClick={this.newSolider}>Add New Soldier</Button>
            </Container>
          )
        }
      }
    }
    //ADMIN
    if (this.state.view === 'detail') { 
      const soldier = this.state.soldier
      if (this.state.isAdmin && this.state.secure) {
        return (
        <Container>
          <SweetAlert show = {this.state.confirm} title="Done!" onConfirm={() => this.setState({ confirm: false, view: 'intro' })}/>
          <h1>Find My Soldier</h1>
          <h3><Label>ADMIN</Label></h3>
          <Form horizontal>
            <BackButton onClick={() => this.setState({view: 'intro'})}>{`< Back to Search`}</BackButton>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                First Name
              </Col>
              <Col xs={10}>
                <FormControl
                  type="text"
                  value={soldier.firstName}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, firstName:e.target.value}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                First Name
              </Col>
              <Col xs={10}>
                <FormControl
                  type="text"
                  value={soldier.lastName}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, lastName:e.target.value}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Rank
              </Col>
              <Col xs={10}>
                <FormControl
                  type="text"
                  value={soldier.rank}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, rank:e.target.value}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Branch
              </Col>
              <Col xs={10}>
                <FormControl
                  type="text"
                  value={soldier.branch}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, branch:e.target.value}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Conflict
              </Col>
              <Col xs={10}>
                <FormControl
                  type="text"
                  value={soldier.conflict}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, conflict:e.target.value}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            {navigator.geolocation ? <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>                
              </Col>
              <Col xs={10}>
                {this.state.isLocating ? 
                 <Button bsStyle='default' disabled>Locating...</Button> :
                 <Button bsStyle='primary' onClick={this.getGeoLocation}>Get Current Location</Button>}
              </Col>
            </FormGroup> : null}
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Lat
              </Col>
              <Col xs={10}>
                <FormControl
                  type="number"
                  value={soldier.geo.latitude}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, geo:{latitude: parseFloat(e.target.value), longitude: this.state.soldier.geo.longitude}}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>
                Long
              </Col>
              <Col xs={10}>
                <FormControl
                  type="number"
                  value={soldier.geo.longitude}
                  onChange={ e => {
                    const newSoldier = {...this.state.soldier, geo:{longitude: parseFloat(e.target.value), latitude: this.state.soldier.geo.latitude}}
                    this.setState({soldier: newSoldier})
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>                
              </Col>
              <Col xs={10}>
                {this.state.isPosting ? 
                 <Button bsStyle='default' disabled>Saving...</Button> :
                 <Button bsStyle='primary' onClick={this.putSoldier}>Save Changes</Button>}
              </Col>
            </FormGroup>
            {this.state.soldier && this.state.soldier._id ?
            <FormGroup>
              <Col componentClass={ControlLabel} xs={2}>                
              </Col>
              <Col xs={10}>
                {this.state.isPosting ? 
                 <Button bsStyle='danger' disabled>Saving...</Button> :
                 <Button bsStyle='danger' onClick={this.deleteSoldier}>Delete Soldier</Button>}
              </Col>
            </FormGroup> : null}
          </Form>
        </Container>)
      //NON ADMIN
      } else { 
        return (
          <Container>
            <h1>Find My Soldier</h1>
            <Form horizontal>
            <BackButton onClick={() => this.setState({view: 'intro'})}>{`< Back to Search`}</BackButton>

              <FormGroup>
                <Col componentClass={ControlLabel} xs={4}>
                </Col>
                <Col xs={8}>
                </Col>
              </FormGroup>
              <FormGroup>
                <Col componentClass={ControlLabel} xs={2}>
                  Name
                </Col>
                <Col xs={10}>
                  {soldier.label}
                </Col>
              </FormGroup>
              <FormGroup>
                <Col componentClass={ControlLabel} xs={2}>
                  Rank
                </Col>
                <Col xs={10}>
                  {soldier.rank}
                </Col>
              </FormGroup>
              <FormGroup>
                <Col componentClass={ControlLabel} xs={2}>
                  Branch
                </Col>
                <Col xs={10}>
                  {soldier.branch}
                </Col>
              </FormGroup>
              <FormGroup>
                <Col componentClass={ControlLabel} xs={2}>
                  Conflict
                </Col>
                <Col xs={10}>
                  {soldier.conflict}
                </Col>
              </FormGroup>
            </Form>
            <h4>Location</h4>
            <Marker
              apikey={GOOGLE_MAPS_API_KEY}
              zoom={7}
              center={{ lat: soldier.geo.latitude, lng: soldier.geo.longitude }}
              locations={[{ lat: soldier.geo.latitude, lng: soldier.geo.longitude, title: soldier.label }]}
              height={300}
              width={window.innerWidth - 20}
            />
          </Container>
        )
      }
    }
  }
}

export default App;
