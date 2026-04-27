export const isValidEmail = email => {
  const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w+)+$/;
  return reg.test(email);
};

export const isValidPassword = password => {
  if (password.length < 8) {
    return false;
  } else {
    const hasNumber =
      /^(?=.{8,}$)(?=.*?[A-Z a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$/;
    return hasNumber.test(password);
  }
};
