// replace with personal access token
mapboxgl.accessToken = "pk.eyJ1IjoidGFpa2VuIiwiYSI6ImNrbG1kMnY3MjA4Mmcybm11Z2pkOWk2bjMifQ.GS9X1569EubkVJMcVlRC2Q";


// create a map and give it some initial settings
const map = new mapboxgl.Map({
    container: "map",
    zoom: 14,
    center: [9.9937, 53.5511], // Updated to Hamburg's coordinates
    pitch: 50,
    bearing: 41,
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/satellite-streets-v12",
});

// this gets executed then the map is loaded
// its the initial function were the data is loaded and the map styles (e.g. terrain) added
map.on('load', async () => {

    // load some geojson data
    // async fetching based on this example: https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
    const response = await fetch(
      './data/shapes.geojson'
    );
    const data = await response.json();
    console.log(data);

    // display the polygons from the geojson
    // from this example: https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/#docs-content
    data.features.forEach((feature, index) => {
      // Add polygons as a layer
      map.addLayer({
        id: `polygon-${index}`,
        type: 'fill',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [feature] // here the geo-json data is added 
          }
        },
        paint: {
          'fill-color': '#0000ff', // blue fill
          'fill-opacity': 0.5
        }
      });

      // Add borders to the polygons
      // can also be uncommented
      map.addLayer({
        id: `polygon-border-${index}`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [feature] // here the geo-json data is added 
          }
        },
        paint: {
          'line-color': '#ff0000', // red border
          'line-width': 2
        }
      });
    });
    
    // add the 3d terrain to the map
    // https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/
    // this one also looks interesting: https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-v2/
    // or you create your own custom one in the mapbox studio: https://www.mapbox.com/blog/3d-design-terrain-and-sky-component-in-mapbox-studio
    map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    
});


