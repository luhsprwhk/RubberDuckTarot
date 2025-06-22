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
      try {
        // Access the event properties
        // The event structure might be different than expected
        const customEvent = event as {
          placePrediction?: PlacePrediction;
          detail?: { placePrediction?: PlacePrediction };
        };

        let placePrediction;
        if (customEvent.placePrediction) {
          placePrediction = customEvent.placePrediction;
        } else if (customEvent.detail && customEvent.detail.placePrediction) {
          placePrediction = customEvent.detail.placePrediction;
        } else {
          console.warn('Could not find placePrediction in event');
          console.log('Full event:', customEvent);
          return;
        }

        // Convert the prediction to a place
        const place = await placePrediction.toPlace();

        // Fetch additional fields for the place
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'types'],
        });

        // Convert the place to a format compatible with our existing code
        const placeResult = {
          formatted_address: place.formattedAddress,
          geometry: {
            location: place.location,
          },
          name: place.displayName,
          types: place.types,
        } as google.maps.places.PlaceResult;

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
