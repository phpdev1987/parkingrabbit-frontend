import React, { Component } from 'react'
import AlgoliaPlaces from 'algolia-places-react'
import './SearchBtn.scss'


const algoliaPlacesAppId = `${process.env.REACT_APP_ALGOLIA_PLACES_APP_ID}`
const algoliaPlacesAppKey = `${process.env.REACT_APP_ALGOLIA_PLACES_APP_KEY}`

// console.log(algoliaPlacesAppId)

class SearchBtn extends Component {

  handleCoordinates = coordinatesArr => {
    // console.log(coordinatesArr.constructor.name)
    // console.log(coordinatesArr)
    this.props.handleSetLatLng(coordinatesArr)
    // this.props.handleSetLng(coordinatesArr[1])
  }

  handleLocation = locationName => {
    this.props.handleSetLocationText(locationName)
  }

  render() {
    return (
      <div className='SearchBtn'>
        <AlgoliaPlaces
        className='SearchBtn__Input'
          placeholder='Search Address, Place, District, or Zipcode'
          options={{
            appId: algoliaPlacesAppId,
            apiKey: algoliaPlacesAppKey,
            language: 'en',
            countries: ['us'],
            aroundLatLng: '37.773972, -122.431297',
            aroundRadius: 10000
            // useDeviceLocation: true
            // type: 'city'
            // Other options from https://community.algolia.com/places/documentation.html#options
          }}
          onChange={({ query, rawAnswer, suggestion, suggestionIndex }) => {
            // console.log(
            //   'Fired when suggestion selected in the dropdown or hint was validated.'
            // )
            // console.log([suggestion.latlng.lat, suggestion.latlng.lng])
            this.handleCoordinates([suggestion.latlng.lat, suggestion.latlng.lng])
            
            // console.log(suggestion.name)
            this.handleLocation(suggestion.name)
          }}
          // onSuggestions={({ rawAnswer, query, suggestions }) =>
          //   console.log(
          //     'Fired when dropdown receives suggestions. You will receive the array of suggestions that are displayed.'
          //   )
          // }
          // onCursorChanged={({ rawAnswer, query, suggestion, suggestonIndex }) =>
          //   console.log(
          //     'Fired when arrows keys are used to navigate suggestions.'
          //   )
          // }
          // onClear={() => console.log('Fired when the input is cleared.')}
          // onLimit={({ message }) =>
          //   console.log('Fired when you reached your current rate limit.')
          // }
          // onError={({ message }) =>
          //   console.log(
          //     'Fired when we could not make the request to Algolia Places servers for any reason but reaching your rate limit.'
          //   )
          // }
        />
      </div>
    )
  }
}

export default SearchBtn
