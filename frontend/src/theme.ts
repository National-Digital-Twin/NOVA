// SPDX-License-Identifier: Apache-2.0
// © Crown Copyright 2026. This work has been developed by the National Digital Twin Programme and is legally attributed to the UK's Department for Business, Innovation, Science and Trade (BIST) as the governing entity.

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
        MuiRadio: {
            defaultProps: {
                color: 'secondary',
            },
        },
    },
});

export default theme;
