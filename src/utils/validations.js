const validateEmail = (email) => {
  // This regex checks for:
  // - At least one character before @ that isn't whitespace or @
  // - A single @ symbol
  // - At least one character after @ that isn't whitespace or @
  // - A single dot
  // - At least one character after the dot that isn't whitespace or @
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // This regex checks for:
  // - At least 8 characters total
  // - At least 1 lowercase letter
  // - At least 1 uppercase letter  
  // - At least 1 number
  // - At least 1 special character (@$!%*?&)
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
const validateFounderProfile = (profileData, update = false) => {
  const errors = [];

  // Validate startUpName if provided
  if (profileData.startUpName) {
    if (profileData.startUpName.length < 2) {
      errors.push('Startup name must be at least 2 characters long');
    }
  } else if (!update) {
    errors.push('Startup name is required');
  }

  // Validate businessIdea if provided
  if (profileData.businessIdea) {
    // For new profiles, require both fields
    if (!update) {
      if (!profileData.businessIdea.problemStatement) {
        errors.push('Problem statement is required');
      }
      if (!profileData.businessIdea.uniqueValueProposition) {
        errors.push('Unique value proposition is required');
      }
    } else {
      // For updates, validate fields if they are provided
      if (profileData.businessIdea.problemStatement === '') {
        errors.push('Problem statement cannot be empty');
      }
      if (profileData.businessIdea.uniqueValueProposition === '') {
        errors.push('Unique value proposition cannot be empty');
      }
    }
  } else if (!update) {
    errors.push('Business idea is required');
  }

  // Validate fundingNeeds if provided
  if (profileData.fundingNeeds) {
    if (profileData.fundingNeeds.amount !== undefined) {
      if (profileData.fundingNeeds.amount <= 0) {
        errors.push('Funding amount must be greater than 0');
      }
    }
    
    if (profileData.fundingNeeds.usagePlan !== undefined) {
      if (!profileData.fundingNeeds.usagePlan) {
        errors.push('Funding usage plan cannot be empty');
      }
    } else if (!update) {
      errors.push('Funding usage plan is required');
    }
  } else if (!update) {
    errors.push('Funding needs is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateFiles = (files, type) => {
  const errors = [];
  const maxSizes = {
    pitchDeck: 10 * 1024 * 1024, // 10MB
    productDemos: 50 * 1024 * 1024, // 50MB
    multimedia: 20 * 1024 * 1024 // 20MB
  };

  const allowedTypes = {
    pitchDeck: ['application/pdf'],
    productDemos: ['video/mp4', 'video/webm', 'image/jpeg', 'image/png'],
    multimedia: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
  };

  if (!files || (Array.isArray(files) && files.length === 0)) {
    errors.push(`No ${type} files provided`);
    return { isValid: false, errors };
  }

  const fileArray = Array.isArray(files) ? files : [files];

  fileArray.forEach(file => {
    if (file.size > maxSizes[type]) {
      errors.push(`File ${file.originalname} exceeds maximum size limit`);
    }

    if (!allowedTypes[type].includes(file.mimetype)) {
      errors.push(`File ${file.originalname} has unsupported format`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUserCredentials,
  validateEmail,
  validatePassword,
  validateFounderProfile,
  validateFiles
}; 