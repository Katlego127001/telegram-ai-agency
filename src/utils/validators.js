const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateBusinessType = (type) => {
  const validTypes = [
    'restaurant',
    'retail',
    'saas',
    'ecommerce',
    'service',
    'agency',
    'manufacturing',
    'healthcare',
    'education',
    'real_estate'
  ];
  return validTypes.includes(type.toLowerCase());
};

const validateCommand = (input) => {
  const parts = input.trim().split(/\s+/);
  return {
    command: parts[0].toLowerCase(),
    args: parts.slice(1)
  };
};

module.exports = {
  validateEmail,
  validateBusinessType,
  validateCommand
};