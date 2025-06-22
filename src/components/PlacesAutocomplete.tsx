import React, { useRef, useEffect } from 'react';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  initialValue?: string;
}

// Define interfaces for Google Maps Place API
interface GoogleMapsPlace {
  formattedAddress?: string;
  displayName?: string;
  location?: google.maps.LatLng;
  geometry?: {
    location?: google.maps.LatLng;
  };
  types?: string[];
  fetchFields: (options: { fields: string[] }) => Promise<void>;
  toJSON: () => Record<string, unknown>;
}

// Used in the event handler
type PlacePrediction = {
  toPlace: () => Promise<GoogleMapsPlace>;
};

// Add the custom element to JSX

 
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          placeholder?: string;
          'place-types'?: string;
          fields?: string;
          value?: string;
          'included-primary-types'?: string[];
        },
        HTMLElement
      >;
    }
  }
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  initialValue = '',
}) => {
  const autocompleteRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!autocompleteRef.current) {
      return;
    }

    const handlePlaceSelect = async (event: Event) => {
      console.log('Place select event fired', event);

      try {
        // Access the event properties
        // The event structure might be different than expected
        const customEvent = event as {
          placePrediction?: PlacePrediction;
          detail?: { placePrediction?: PlacePrediction };
        };

        // Log the event structure to help debug
        console.log('Event structure:', Object.keys(customEvent));

        // Check all possible locations for placePrediction
        let placePrediction;
        if (customEvent.placePrediction) {
          placePrediction = customEvent.placePrediction;
          console.log('Found placePrediction directly on event');
        } else if (customEvent.detail && customEvent.detail.placePrediction) {
          placePrediction = customEvent.detail.placePrediction;
          console.log('Found placePrediction in event.detail');
        } else {
          console.warn('Could not find placePrediction in event');
          console.log('Full event:', customEvent);
          return;
        }

        console.log('Place prediction found:', placePrediction);

        // Convert the prediction to a place
        const place = await placePrediction.toPlace();
        console.log('Place object:', place);

        // Fetch additional fields for the place
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'types'],
        });

        // Get the place types to verify it's a city
        const placeTypes = place.types || [];
        console.log('Place types:', placeTypes);

        // Check if the place is a city (locality) or administrative area
        const isCityOrRegion =
          place.types &&
          (place.types.includes('locality') ||
            place.types.includes('administrative_area_level_1') ||
            place.types.includes('administrative_area_level_2'));

        if (!isCityOrRegion) {
          console.warn('Selected place is not a city:', place.displayName);
          // Optionally, show an error message to the user
          return;
        }

        // Convert the place to a format compatible with our existing code
        const placeResult = {
          formatted_address: place.formattedAddress,
          geometry: {
            location: place.location,
          },
          name: place.displayName,
          types: place.types,
        } as google.maps.places.PlaceResult;

        console.log('Converted place result:', placeResult);
        onPlaceSelect(placeResult);
      } catch (error) {
        console.error('Error handling place selection:', error);
      }
    };

    const currentAutocompleteRef = autocompleteRef.current;

    // Use the correct event name: 'gmp-select' instead of 'gmp-placechange'
    currentAutocompleteRef.addEventListener('gmp-select', handlePlaceSelect);

    return () => {
      currentAutocompleteRef.removeEventListener(
        'gmp-select',
        handlePlaceSelect
      );
    };
  }, [onPlaceSelect]);

  return (
    <gmp-place-autocomplete
      ref={autocompleteRef}
      placeholder="Enter a city"
      value={initialValue}
      fields="name,formatted_address,types"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
      place-types="locality"
      included-primary-types={['locality']}
    />
  );
};

export default PlacesAutocomplete;
