const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateName = (name) => {
  return name && name.length >= 2 && name.length <= 50;
};

const validateUserCredentials = (userData) => {
  const errors = [];

  if (!validateName(userData.name)) {
    errors.push('Name must be between 2 and 50 characters');
  }

  if (!validateEmail(userData.email)) {
    errors.push('Invalid email format');
  }

  if (!validatePassword(userData.password)) {
    errors.push('Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUserCredentials,
  validateEmail,
  validatePassword,
  //validateName
}; 