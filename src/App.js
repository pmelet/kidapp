import React, { Component } from 'react';
import Masonry from 'react-masonry-component';
import logo from './logo.svg';
import './App.css';
import Moment from 'moment';
import WayPoint from 'react-waypoint';

Moment.lang('fr');

var rooturl = (window.location.hostname === "localhost") ? "http://titouan.melet-tary.fr" : "";
var columnWidth = 90, gutter = 1;

class Photo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paysage: this.props.paysage,
      portrait: this.props.portrait,
      square: this.props.square,
    }
  }

  updateOrientation(){
    var paysage = false, portrait = false, square = false;
    if(this.img.naturalWidth === this.img.naturalHeight) {
      square = true;
    } else if(this.img.naturalWidth > this.img.naturalHeight) {
      paysage = true;
    } else {
      portrait = true;
    }
    console.log(this.img.naturalWidth / this.img.naturalHeight);
    this.setState({ paysage, portrait, square })
  }

  zoomOn(name){
    this.props.zoomOn(rooturl + "/images/" + name);
    return false;
  }

  // style={{ width: width-20, padding, margin: 8, borderRadius: 4, border: "2px solid white", boxShadow: "#888 0px 0px 10px 2px" }} 

  render() {
    var sizer = (this.state.portrait ? "r":(this.state.square ? "s":"p")),
        padding = 0, margin = 0;
    return (
      <div className={"grid-item grid-item-"+sizer}>
        <div>
          <img 
              onClick={this.zoomOn.bind(this,this.props.name)}
              alt={this.props.name} 
              src={rooturl + "/images/"+this.props.name}
              ref={(x) => { this.img = x }}
              onLoad={this.updateOrientation.bind(this)}/>
          <label>{Moment(this.props.name.split(".")[0], "YYYY-MM-DD-HHmm").subtract(55,"minutes").format("LLLL")}</label>
        </div>
      </div>
    );
  }
}

class Section extends Component {
  constructor(props) {
    super(props);
    this.state = { showing: false }
  }
  _handleWaypointEnter(){
    this.state.showing = true;
    this.setState(this.state);
    console.log("show",this.props.title);
  }
  _handleWaypointLeave(){

  }
  render() {
    return (
      <WayPoint   
        onEnter={this._handleWaypointEnter.bind(this)}
        onLeave={this._handleWaypointLeave.bind(this)}>
        <div style={{minHeight:"500px"}}>
          <h1>{this.props.title}</h1>
          <Masonry options={{
              // set itemSelector so .grid-sizer is not used in layout
              itemSelector: '.grid-item',
              // use element for option
              columnWidth: '.grid-sizer',
              percentPosition: true,
            }}>
            <div className="grid-sizer"/>
            {
              this.state.showing 
              ? this.props.images.map((x,i) => 
                  <Photo key={i} name={x} zoomOn={this.props.zoomOn} />) 
              : null
            }
          </Masonry>
        </div>
      </WayPoint>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { }
  }
  
  componentWillMount() {
    fetch(rooturl + "/config.json")
    .then((response) => response.json().then(config => this.setState({config}) ));
  }

  zoomOn(path){
    this.state.selected = path;
    this.setState(this.state);
  }

  render() {
    if(this.state.config)
      document.title = this.state.config.title;
    return (
      <div>
        <header>
          {
            this.state.config
            ? <div style={{
                    backgroundImage: "url("+rooturl+"/images/"+this.state.config.banner+")",
                    backgroundPosition: this.state.config.center,
                  }}>
                <label>{this.state.config.title}</label>
              </div>
            : null
          }
        </header>
        <article>
          {
            this.state.config
            ? this.state.config.galleries.map((x,i) => <Section key={i} {...x} zoomOn={this.zoomOn.bind(this)}/>) 
            : null
          }
          {
            this.state.selected
            ? <div className="modal">
                <img src={this.state.selected} onClick={this.zoomOn.bind(this,null)}/>
              </div>
            : null
          }
        </article>
      </div>
    );
  }
}

export default App;
