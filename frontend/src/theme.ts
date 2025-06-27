import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#001f3f',
        },
        secondary: {
            main: '#3670b3',
        },
        divider: '#1c1c1c',
    },
    components: {
        MuiButton: {
            defaultProps: {
                color: 'secondary',
            },
        },
        MuiCheckbox: {
            defaultProps: {
                color: 'secondary',
            },
        },
        MuiIconButton: {
            defaultProps: {
                color: 'secondary',
            },
        },
    },
});

export default theme;
