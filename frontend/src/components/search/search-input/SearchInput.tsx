import { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { SearchResponse } from '../../../types/searchResponse';

interface SearchInputProps {
  onSearchResultClick: (lat: number, lon: number, zoom : number) => void;
}

const SearchInput = ({ onSearchResultClick }: SearchInputProps) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<SearchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (input.trim().length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);

    const timeout = setTimeout(() => {
      fetch(`/api/ui/search?location=${encodeURIComponent(input)}`, {
        signal: controller.signal,
      })
        .then(res => res.json())
        .then((data: SearchResponse[]) => {
          setOptions(data);
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [input]);

  return (
    <Autocomplete<SearchResponse>  
      fullWidth
      loading={loading}
      options={options}
      getOptionLabel={(option) => option.name}
      onInputChange={(_e, value) => setInput(value)}
      onChange={(_e, value) => {
        if (value && 'latitude' in value && 'longitude' in value) {
          onSearchResultClick(value.latitude, value.longitude, value.zoom);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search by region, county"
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
            inputProps: {
              ...params.inputProps,
              'aria-label': 'Search by region or county',
            },
          }}
        />
      )}
    />
  );
};

export default SearchInput;
