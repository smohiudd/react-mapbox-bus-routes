import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl'
import { center } from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css';
import bus_list from './bus_list.json'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FhZGlxbSIsImEiOiJjamJpMXcxa3AyMG9zMzNyNmdxNDlneGRvIn0.wjlI8r1S_-xxtq2d-W5qPA';

class Application extends React.Component {

  constructor(props) {
    super(props);
    this.handle_bus = this.handle_bus.bind(this)
    this.state = {
      lng: -114.0708,
      lat: 51.0486,
      zoom: 11,
      buses:bus_list,
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

    this.map.on('load', () => {
      let geojson = 'https://data.calgary.ca/resource/ihrr-t58g.geojson?route_short_name='+this.state.selected_bus+'&$select=the_geom'
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
  handle_bus(e){
    e.preventDefault();
    let selection = e.target.value;

    this.setState({selected_bus: selection}, () => {
      let geojson = 'https://data.calgary.ca/resource/ihrr-t58g.geojson?route_short_name='+this.state.selected_bus+'&$select=the_geom'

      fetch(geojson)
        .then(response => {
            return response.json();
        }).then(data => {
            let turf_center = center(data);
            let center_coord = turf_center.geometry.coordinates;
            this.map.flyTo({
             center: center_coord,
             zoom: 12
            });
        });

      this.map.getSource('Bus Route').setData(geojson);

    });
  }

  render() {

    let bus_routes = this.state.buses;
    let optionItems = bus_routes.map((bus) => <option key={bus.route_short_name} value={bus.route_short_name}>{bus.route_short_name+" - "+bus.route_long_name}</option>);
    // className="inline-block absolute top left"
    return (
      <div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <select onChange={this.handle_bus} value={this.state.value}  style={{display: "inline-block",position: "absolute", height: "40px",width:"450px",padding: "10px",top:"40px", left:"40px", fontSize:"17px",border: "none",borderRadius: "3px",color: "#fff",
        background: "#6d6d6d", fontStyle:"bold",outline:"none"}}>
          {optionItems}
        </select>

      </div>
    );
  }
}
ReactDOM.render(<Application />, document.getElementById('root'));
