import React, { Component } from 'react'
// import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'
import Filter from './Filter'
import ListingCard from './ListingCard'
import './MapPage.scss'

const styleLink = document.createElement('link')
styleLink.rel = 'stylesheet'
styleLink.href =
  'https://api.tiles.mapbox.com/mapbox-gl-js/v1.3.1/mapbox-gl.css'
document.head.appendChild(styleLink)

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_API_KEY}`

class MapPage extends Component {
  constructor() {
    super()

    this.map = undefined

    this.state = {
      active: '',
      // LONGER WAY
      // lng: props.setLng,
      // lat: props.setLat,
      zoom: 13,
      stores: {
        type: 'FeatureCollection',
        features: []
      }
    }
  }

  componentDidMount() {
    const listingsUrl = 'http://localhost:3000/listings'
    fetch(listingsUrl)
      .then(response => response.json())
      .then(result => {
        // console.log(result)

        let stores = {
          type: 'FeatureCollection',
          features: []
        }

        result.data.forEach(listing => {
          // console.log(listing)
          stores.features.push(this.convertJSONToGEOJSON(listing))
        })

        // console.log(stores)

        this.setState({
          stores: stores
        })
      })

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      // PASSING DOWN PROPS IS EASIER THAN PASSING DOWN PROPS TO STATE ON THIS COMPONENTS
      center: [this.props.setLng, this.props.setLat],

      // LONGER WAY
      // center: [this.state.lng, this.state.lat]

      zoom: this.state.zoom
    })

    this.map.on('load', e => {
      /* Add the data to your map as a layer */
      this.map.addLayer({
        id: 'locations',
        type: 'symbol',
        /* Add a GeoJSON source containing place coordinates and information. */
        source: {
          type: 'geojson',
          data: this.state.stores
        },
        layout: {
          // 'icon-image': 'restaurant-15',
          'icon-allow-overlap': true
        }
      })
      // this.addCurrentLocationMarker()
      this.addListingMarkers()
    })

    // DO WE NEED THIS?
    // this.map.on('click', function(e) {
    //   console.log("from this.map.on 'click'")
    // })
  } // end of componentDidMount()


  componentDidUpdate() {
    const removeLocationMarker = document.querySelector('.marker__location')
    
    if (removeLocationMarker) {
      removeLocationMarker.remove()
    }

    this.addCurrentLocationMarker()
  }



  convertJSONToGEOJSON = listing => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [listing.attributes.long, listing.attributes.lat]
      },
      properties: {
        id: +listing.id, // converts id to a number
        name: listing.attributes.name,
        address: listing.attributes.address,
        city: listing.attributes.city,
        zipcode: listing.attributes.zipcode,
        description: listing.attributes.description,
        hourly_price: listing.attributes.hourly_price,
        monthly_price: listing.attributes.monthly_price,
        available_start: listing.attributes.available_start,
        available_end: listing.attributes.available_end
      }
    }
  }

  flyToStore = currentFeature => {
    console.log('from flyToStore')
    console.log(currentFeature)
    this.map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 13
    })
  }

  createPopUp = currentFeature => {
    console.log('from createPopUp')
    var popUps = document.getElementsByClassName('mapboxgl-popup')
    // console.log(popUps)
    // /** Check if there is already a popup on the map and if so, remove it */
    if (popUps[0]) popUps[0].remove()

    // var popup = new mapboxgl.Popup({ closeOnClick: false })
    new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
        '<h3>Sweetgreen</h3>' +
          '<h4>' +
          currentFeature.properties.address +
          '</h4>'
      )
      .addTo(this.map)
  }

  addCurrentLocationMarker = e => {
    // console.log(e)
    const el = document.createElement('div')
    el.className = 'marker__location'


    new mapboxgl.Marker(el)
      .setLngLat([this.props.setLng, this.props.setLat])
      .addTo(this.map)
  }

  addListingMarkers = myComp => {
    /* For each feature in the GeoJSON object above: */
    this.state.stores.features.forEach(marker => {
      /* Create a div element for the marker. */
      const el = document.createElement('div')
      /* Assign a unique `id` to the marker. */
      el.id = 'marker__listing--' + marker.properties.id
      /* Assign the `marker` class to each marker for styling. */
      el.className = 'marker__listing'
      // console.log(marker.properties)
      el.textContent = `$${marker.properties.hourly_price}`

      /**
       * Create a marker using the div element
       * defined above and add it to the map.
       **/
      //  console.log(myComp)
      // console.log(marker.geometry.coordinates)
      new mapboxgl.Marker(el) // { offset: [0, -23] }
        .setLngLat(marker.geometry.coordinates)
        .addTo(this.map)
    })
  }

  handleClick = (storeInfo, id) => {
    console.log('from handleClick in parent component')
    // console.log(this.state)
    this.flyToStore(storeInfo)
    // DISABLE POP-UP. RE-RENDER SIDEBAR INFO INSTEAD
    // this.createPopUp(storeInfo)
    this.setState({
      active: `listing -${id}`
    })

    var activeItem = document.getElementsByClassName('active')
    // console.log(`activeItem: ${activeItem[0]}`)
    if (activeItem[0]) {
      activeItem[0].classList.remove('active')
      // console.log(activeItem.length)
    }
    document.querySelector(`#listing-${id}`).classList.add('active')
    // this.parentNode.classList.add('active')
    // console.log(document.querySelector(`#listing-${id}`).classList)
  }

  render() {
    return (
      <div className='Map'>
        <main className='Map__container'>
          <article className='Map__filter'>
            <Filter handleSetLatLng={this.props.handleSetLatLng} />
          </article>

          <article className='Map__content'>
            <aside className='Map__sidebar'>
              <div className='Map__header'>
                <h1 className='Map__headerText'>Listings</h1>
              </div>
              <div id='listings' className='Map__listings'>
                {/* MAP THROUGH LISTINGCARD HERE */}
                {this.state.stores.features.map((listing, i) => {
                  // console.log(store)
                  return (
                    <ListingCard
                      key={i}
                      id={i}
                      listing={listing}
                      handleClick={this.handleClick}
                    />
                  )
                })}
              </div>
            </aside>
            <section
              className='Map__canvas'
              ref={el => (this.mapContainer = el)}
            ></section>
          </article>
        </main>
      </div>
    )
  }
}

export default MapPage
