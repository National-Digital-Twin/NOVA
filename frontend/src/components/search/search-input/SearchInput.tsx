import { Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment, styled, TextField } from '@mui/material';
import { useState } from 'react';

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        minHeight: 48,
        height: 48,
        padding: '0 16px',
        '& fieldset': {
            top: 0,
            margin: 0,
            border: 'none',
        },
        '&:hover fieldset': {
            borderWidth: 0,
            outline: '5px solid',
            outlineColor: theme.palette.secondary.dark,
        },
        '&.Mui-focused fieldset': {
            borderWidth: 0,
            outline: '5px solid',
            outlineColor: theme.palette.secondary.main,
        },
    },
}));

interface SearchInputProps {
    onSearch: (query: string) => void;
}

const SearchInput = ({ onSearch }: SearchInputProps) => {
    const [value, setValue] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && value.trim()) {
            onSearch(value.trim());
        }
    };

    return (
        <StyledTextField
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search by region, country"
            variant="outlined"
            fullWidth
            slotProps={{
                input: {
                    'aria-label': 'Search by region or country',
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
};

export default SearchInput;
