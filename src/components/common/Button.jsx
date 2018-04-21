import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="button"
  >
    {label}
  </button>
);

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export { Button }; // eslint-disable-line import/prefer-default-export
