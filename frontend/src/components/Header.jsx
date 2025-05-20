import React from 'react';
import novaLogo from '../assets/nova-logo.svg';

function Header() {
  const headerStyle = {
    backgroundColor: '#001f3f', // Dark navy blue
    width: '100%',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: 1000 // Ensure header appears above other elements
  };

  const logoStyle = {
    height: '20px'
  };

  return (
    <header style={headerStyle}>
      <img src={novaLogo} alt="NOVA Logo" style={logoStyle} />
    </header>
  );
}

export default Header;
