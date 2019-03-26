import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl'
import { center } from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css';
import bus_list from './bus_list.json' //list of all bus routes

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FhZGlxbSIsImEiOiJjamJpMXcxa3AyMG9zMzNyNmdxNDlneGRvIn0.wjlI8r1S_-xxtq2d-W5qPA';

class Application extends React.Component {

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this)
    this.state = {
      lng: -114.0708,
      lat: 51.0486,
      zoom: 11,
      selected_bus: 1,
    };
  }

  componentDidMount() {

    const {lng, lat, zoom } = this.state;
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/saadiqm/cjbjougmt08z72rsa7me1duoi',
      center: [lng, lat],
      zoom
    });

    this.map.on('load', () => { //Get initial geojson data from Calgary Open Data
      let geojson = 'https://data.calgary.ca/resource/hpnd-riq4.geojson?route_short_name='+this.state.selected_bus
      this.map.addSource('Bus Route', {
        type: 'geojson',
        data: geojson
      });
      this.map.addLayer({
          "id": "Bus Route",
          "type": "line",
          "source": 'Bus Route',
          "paint": {
              "line-color": "#FF0000",
              "line-width": 7,
              "line-opacity": 0.2
          },
          "layout": {
              "line-join": "round",
              "line-cap": "round"
          },
      });
    });
  }
  handleSelect(e){
    e.preventDefault();
    let selection = e.target.value;

    this.setState({selected_bus: selection}, () => { //update selected bus route
      let geojson = 'https://data.calgary.ca/resource/hpnd-riq4.geojson?route_short_name='+this.state.selected_bus

      fetch(geojson)
        .then(response => {
            return response.json();
        }).then(data => {
            let turf_center = center(data); //find center of bus route using Turf
            let center_coord = turf_center.geometry.coordinates;
            this.map.flyTo({
             center: center_coord,
             zoom: 12
            });
        });

      this.map.getSource('Bus Route').setData(geojson); //update data source through Mapbox setData()

    });
  }

  render() {

    let optionItems = bus_list.map((bus) => <option key={bus.route_short_name} value={bus.route_short_name}>{bus.route_short_name+" - "+bus.route_long_name}</option>);

    return (
      <div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <select onChange={this.handleSelect} value={this.state.value}  style={{display: "inline-block",position: "absolute", height: "40px",width:"450px",padding: "10px",top:"40px", left:"40px", fontSize:"17px",border: "none",borderRadius: "3px",color: "#fff",
        background: "#6d6d6d", fontStyle:"bold",outline:"none"}}>
          {optionItems}
        </select>

      </div>
    );
  }
}
ReactDOM.render(<Application />, document.getElementById('root'));
