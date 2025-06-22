import React, { useRef, useEffect } from 'react';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  initialValue?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  initialValue = '',
}) => {
  const autocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  useEffect(() => {
    if (!autocompleteRef.current) {
      return;
    }

    const handlePlaceChange = (event: Event) => {
      const customEvent = event as CustomEvent<google.maps.places.PlaceResult>;
      const place = customEvent.detail;

      if (place?.geometry && place.formatted_address) {
        onPlaceSelect(place);
      }
    };

    const currentAutocompleteRef = autocompleteRef.current;

    currentAutocompleteRef.addEventListener(
      'gmp-placechange',
      handlePlaceChange
    );

    return () => {
      currentAutocompleteRef.removeEventListener(
        'gmp-placechange',
        handlePlaceChange
      );
    };
  }, [onPlaceSelect]);

  return (
    <gmp-place-autocomplete
      ref={autocompleteRef}
      placeholder="Where did your debugging journey begin?"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
      place-types="locality,administrative_area_level_3"
      fields="formatted_address,geometry,name"
      value={initialValue}
    ></gmp-place-autocomplete>
  );
};

export default PlacesAutocomplete;
