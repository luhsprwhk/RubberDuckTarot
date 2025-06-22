declare namespace JSX {
  interface IntrinsicElements {
    'gmp-place-autocomplete': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        placeholder?: string;
        'place-types'?: string;
        fields?: string;
        value?: string;
      },
      HTMLElement
    >;
  }
}

// Augment the google.maps.places namespace
declare namespace google.maps {
  namespace places {
    interface PlaceAutocompleteElement extends HTMLElement {
      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ): void;
      removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
      ): void;
    }

    interface PlaceResult {
      geometry?: {
        location?: {
          lat: () => number;
          lng: () => number;
        };
        viewport?: {
          northeast: {
            lat: () => number;
            lng: () => number;
          };
          southwest: {
            lat: () => number;
            lng: () => number;
          };
        };
      };
      formatted_address?: string;
      name?: string;
      place_id?: string;
      types?: string[];
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
      photos?: Array<{
        getUrl: (opts: { maxWidth?: number; maxHeight?: number }) => string;
        height: number;
        width: number;
        html_attributions: string[];
      }>;
      rating?: number;
      user_ratings_total?: number;
    }
  }
}
